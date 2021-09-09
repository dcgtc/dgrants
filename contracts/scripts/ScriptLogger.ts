import fs from 'fs';
import readline from 'readline';

export const waitForInput = (query: string): Promise<unknown> => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
};

export class ScriptLogger {
  // filenames
  readonly folderName: string;
  readonly fileName: string;
  readonly latestFileName: string;

  // output parameters
  deployer: string = '';
  config: Record<string, any> = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  contracts: Record<string, string> = {};
  actions: Record<string, string> = {};

  constructor(readonly deployName: string, readonly network: string, readonly folder: string = './deploy-history') {
    const now = new Date().toISOString();
    this.folderName = folder;
    this.fileName = `${this.folderName}/${deployName}-${network}-${now}.json`;
    this.latestFileName = `${this.folderName}/${deployName}-${network}-latest.json`;
  }

  async confirmContinue(): Promise<void> {
    console.log(`Deploying to: ${this.network}`);
    console.log(`Deployer address: ${this.deployer}`);
    console.log('Deployment configuration');
    console.log('------------------------');

    for (const param in this.config) {
      const value = this.config[param];
      console.log(`  ${param}: ${value}`);
    }

    const response = await waitForInput('\nDo you want to continue with deployment? y/N\n');
    if (response !== 'y') {
      throw new Error('User chose to cancel deployment');
    }
  }

  recordContract(name: string, address: string): void {
    console.log(`Deployed ${name} to ${address}`);
    this.contracts[name] = address;
  }

  recordAction(name: string, content: string): void {
    console.log(`${name}: ${content}`);
    this.actions[name] = content;
  }

  save(): void {
    // conditionally create the deploy history folder
    fs.mkdir(this.folderName, (err) => {
      if (err && err.code !== 'EEXIST') throw err;
    });

    const allOutput = {
      deployer: this.deployer,
      config: this.config,
      contracts: this.contracts,
      actions: this.actions,
    };

    fs.writeFileSync(this.fileName, JSON.stringify(allOutput));
    fs.writeFileSync(this.latestFileName, JSON.stringify(allOutput));
  }
}
