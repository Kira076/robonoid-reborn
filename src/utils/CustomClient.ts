import { Client, Collection } from 'discord.js';

import type { ClientOptions } from 'discord.js';

export class ExtendedClient extends Client {
  public commands: Collection<string, any> = new Collection<string, any>();
  constructor(options: ClientOptions) {
    super(options);
  }
}