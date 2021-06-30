const solc = require('solc');
const fs = require('fs-extra');
const path = require('path');

/**
 * Compile .sol smart contracts in ./contracts and save the result in ./build
 * 
 * Content of output .json files:
  {
    abi: "[{\"constant\":false,\"inputs\":[],\"name\":\"withdraw\",\"outputs\":[],\"payable\":true,\"]"
    bytecode: "60806040523480156100"
  }
 */
const buildPath = path.resolve(__dirname, 'build');
const contractsPath = path.resolve(__dirname, 'contracts');

compile = (contracts) => {
    console.log('Compiling smart contracts...')
    const input = {
        language: 'Solidity',
        sources: contracts,
        settings: {
            outputSelection: {
                '*': {
                    '*': [ '*' ]
                }
            }
        }
    }
    const output = JSON.parse(solc.compile(JSON.stringify(input), findImports));
    if (output.errors) {
        console.error(output.errors);
    }
    for (var contractSource in output.contracts) {
        for (var contractName in output.contracts[contractSource]) {
            // save "abi" in interface property of the output file
            let abi = output.contracts[contractSource][contractName].abi;
            // save "evm.bytecode.object" in bytecode property of the output file
            let bytecode = output.contracts[contractSource][contractName].evm.bytecode.object;
            const built = {
                abi: JSON.stringify(abi),
                bytecode: bytecode
            }
            const target = path.resolve(buildPath, path.dirname(contractSource), contractName + ".json");
            console.log(contractName, 'built in', target);
            fs.writeJsonSync(target, built);
        }
    }
}

// Add .sol of import statements
findImports = (import_path) => {
    const sourcePath = path.resolve(contractsPath, import_path);
    const source = fs.readFileSync(sourcePath, 'utf-8');

    return {contents: source};
}

// 1. Recreate build folder
fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

// 2. Get list of contracts
let contracts = {};
fs.readdirSync(contractsPath).forEach(file => {
    if (file.includes('.sol')) {
        const sourcePath = path.resolve(contractsPath, file);
        if (!fs.lstatSync(sourcePath).isDirectory()) {
            const source = fs.readFileSync(sourcePath, 'utf-8');
            contracts[file] = {'content': source}
        }
    }
});

// 3. Compile contracts
compile(contracts);