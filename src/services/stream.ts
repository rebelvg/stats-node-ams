import axios from 'axios';
import * as xml2js from 'xml2js';
import * as _ from 'lodash';
import { URL } from 'url';
import * as moment from 'moment';
import * as fs from 'fs';
import * as path from 'path';
import { strtotime } from 'locutus/php/datetime';

import { AMS } from '../../config';

interface IAmsResponse {
  level: string;
  code: string;
  timestamp: string;
  description?: string;
}

interface IGetApps extends IAmsResponse {
  data: {
    total_apps: string;
    [key: string]: string;
  };
}

interface IGetAppStats extends IAmsResponse {
  data: {
    cores: {
      [key: string]: {
        pid: string;
        core_id: string;
      };
    };
  };
}

interface IGetLiveStreams extends IAmsResponse {
  data: {
    [key: string]: string;
  };
}

interface IGetLiveStreamStats extends IAmsResponse {
  data: {
    name: string;
    publisher: {
      name: string;
      time: string;
      type: string;
      client: string;
      stream_id: string;
      client_type: string;
      diffserv_bits: string;
      publish_time: string;
    };
    subscribers: {
      [key: string]: {
        client: string;
        subscribe_time: string;
      };
    };
  };
}

interface IGetUsers extends IAmsResponse {
  data: {
    name: string;
    [key: string]: string;
  };
}

interface IGetUserStats extends IAmsResponse {
  data: {
    name: string;
    bytes_in: string;
    bytes_out: string;
    msg_in: string;
    msg_out: string;
    msg_dropped: string;
    connect_time: string;
    protocol: string;
    msg_queue: {
      total_queues: string;
      audio: string;
      video: string;
      other: string;
    };
    stream_ids: {
      [key: string]: string;
    };
  };
}

class AmsClient {
  async getAmsStats<T>(command: string, params: string[][] = []): Promise<T> {
    const { host, user, password } = AMS;

    const apiUrl = new URL(`${host}/admin/${command}`);

    apiUrl.searchParams.set('auser', user);
    apiUrl.searchParams.set('apswd', password);

    _.forEach(params, (param) => {
      apiUrl.searchParams.set(param[0], param[1]);
    });

    const { data } = await axios.get(apiUrl.href);

    const parsedXml = await xml2js.parseStringPromise(data, {
      trim: true,
      explicitArray: false,
      explicitRoot: false,
      emptyTag: null,
    });

    if (parsedXml.code !== 'NetConnection.Call.Success') {
      throw new Error(parsedXml.description);
    }

    return parsedXml;
  }

  async getApps(): Promise<string[]> {
    const getApps = await this.getAmsStats<IGetApps>('getApps');

    return _.filter(getApps.data, (appName, key) => {
      return key !== 'total_apps';
    });
  }

  async getAppStats(appName: string): Promise<IGetAppStats['data'] | boolean> {
    const getAppStats = await this.getAmsStats<IGetAppStats>('getAppStats', [
      ['app', appName],
    ]);

    if (!getAppStats.data.cores) {
      return false;
    }

    return getAppStats.data;
  }

  async getLiveStreams(appName: string): Promise<string[]> {
    const getLiveStreams = await this.getAmsStats<IGetLiveStreams>(
      'getLiveStreams',
      [['appInst', appName]],
    );

    if (!getLiveStreams.data) {
      return [];
    }

    return _.values(getLiveStreams.data);
  }

  async getLiveStreamStats(
    appName: string,
    channelName: string,
  ): Promise<IGetLiveStreamStats['data']> {
    const getLiveStreamStats = await this.getAmsStats<IGetLiveStreamStats>(
      'getLiveStreamStats',
      [
        ['appInst', appName],
        ['stream', channelName],
      ],
    );

    return getLiveStreamStats.data;
  }

  async getUserStats(
    appName: string,
    userId: string,
  ): Promise<IGetUserStats['data']> {
    const getUserStats = await this.getAmsStats<IGetUserStats>('getUserStats', [
      ['appInst', appName],
      ['userId', userId],
    ]);

    return getUserStats.data;
  }

  async getUsers(appName: string): Promise<string[]> {
    const getUsers = await this.getAmsStats<IGetUsers>('getUsers', [
      ['appInst', appName],
    ]);

    return _.filter(getUsers.data, (appName, key) => {
      return key !== 'name';
    });
  }

  async parseClientFile(path: string) {
    const clientFile = (await fs.promises.readFile(path, {
      encoding: 'UTF-8',
    })) as string;

    const clientData = clientFile.split(/\r\n|\r|\n/gi);

    if (clientData.length !== 7) {
      throw new Error(`Couldn't parse file.`);
    }

    return {
      amsId: clientData[0],
      connectTime: clientData[1],
      ip: clientData[2],
      agent: clientData[3],
      page: clientData[4],
      referrer: clientData[5],
      password: clientData[6],
    };
  }

  async getIPs(appName: string) {
    const { appsPath } = AMS;

    const clientsFolder = path.join(appsPath, appName, 'clients');

    const clientFiles = await fs.promises.readdir(clientsFolder);

    let fileIDs = [];

    for (const clientFileName of clientFiles) {
      const parsedFile = await this.parseClientFile(
        path.join(clientsFolder, clientFileName),
      );

      fileIDs.push(parsedFile);
    }

    fileIDs = _.sortBy(fileIDs, ['connectTime', 'amsId']);

    const users = await this.getUsers(appName);

    let apiIDs = [];

    await Promise.all(
      _.map(users, async (userId, id) => {
        const userStats = await this.getUserStats(appName, userId);

        apiIDs.push({
          amsId: userId,
          connectTime: moment.unix(strtotime(userStats.connect_time)).toDate(),
          id: id,
        });
      }),
    );

    apiIDs = _.sortBy(apiIDs, ['connectTime', 'id']);

    if (fileIDs.length !== apiIDs.length) {
      throw new Error(`Lengths don't match.`);
    }

    const IPs = {};

    _.forEach(apiIDs, (apiID, key) => {
      IPs[apiID.amsId] = fileIDs[key];
    });

    return IPs;
  }
}

export async function getStats() {
  const { appsPath } = AMS;

  const amsClient = new AmsClient();

  const apps = await amsClient.getApps();

  const stats = [];

  const statsUpdateTime = new Date();

  await Promise.all(
    apps.map(async (appName) => {
      const app = await amsClient.getAppStats(appName);

      if (!app) {
        return;
      }

      const liveApp = {
        app: appName,
        channels: [],
      };

      const IPs = await amsClient.getIPs(appName);

      const liveStreams = await amsClient.getLiveStreams(appName);

      await Promise.all(
        liveStreams.map(async (channelName) => {
          const liveChannel = {
            channel: channelName,
            publisher: null,
            subscribers: [],
          };

          const liveStreamStats = await amsClient.getLiveStreamStats(
            appName,
            channelName,
          );

          if (liveStreamStats.publisher) {
            const id = liveStreamStats.publisher.client;
            const userStats = await amsClient.getUserStats(appName, id);

            const { ip } = await amsClient.parseClientFile(
              path.join(appsPath, appName, 'streams', channelName),
            );

            const streamObj = {
              app: appName,
              channel: channelName,
              connectId: id,
              connectCreated: moment
                .unix(strtotime(userStats.connect_time))
                .toDate(),
              connectUpdated: statsUpdateTime,
              bytes: parseInt(userStats.bytes_in),
              ip,
              protocol: userStats.protocol,
            };

            liveChannel.publisher = streamObj;
          }

          if (liveStreamStats.subscribers) {
            await Promise.all(
              _.map(liveStreamStats.subscribers, async (subscriber) => {
                const id = subscriber.client;
                const userStats = await amsClient.getUserStats(appName, id);

                const subscriberObj = {
                  app: appName,
                  channel: channelName,
                  connectId: id,
                  connectCreated: moment.unix(
                    strtotime(userStats.connect_time),
                  ),
                  connectUpdated: statsUpdateTime,
                  bytes: parseInt(userStats.bytes_out),
                  ip: IPs[id].ip,
                  protocol: userStats.protocol,
                };

                liveChannel.subscribers.push(subscriberObj);
              }),
            );
          }

          liveApp.channels.push(liveChannel);
        }),
      );

      stats.push(liveApp);
    }),
  );

  return stats;
}
