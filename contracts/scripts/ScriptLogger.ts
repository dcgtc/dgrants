import fs from 'fs';

export class ScriptLogger {
  // filenames
  readonly folderName: string;
  readonly fileName: string;
  readonly latestFileName: string;

  // output parameters
  deployer: string = '';
  config: Record<string, any> = {};
  contracts: Record<string, string> = {};
  actions: Record<string, string> = {};

  constructor(readonly deployName: string, readonly network: string, readonly folder: string = './deploy-history') {
    const now = new Date().toISOString();
    this.folderName = folder;
    this.fileName = `${this.folderName}/${deployName}-${network}-${now}.json`;
    this.latestFileName = `${this.folderName}/${deployName}-${network}-latest.json`;
  }

  recordContract(name: string, address: string) {
    console.log(`Deployed ${name} to ${address}`);
    this.contracts[name] = address;
  }

  recordAction(name: string, content: string) {
    console.log(`${name}: ${content}`);
    this.actions[name] = content;
  }

  save() {
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
