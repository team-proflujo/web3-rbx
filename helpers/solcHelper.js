const solc = require('solc');

const SolcHelper = function(logger) {
    this.logger = logger;
}

SolcHelper.prototype.CompileContract = function(contractFileContent) {
    this.logger.Info(`Compiling the contract...`);

    let contractFileName = `contract.sol`;

    let contractCompileOutput = JSON.parse(solc.compile(JSON.stringify({
        language: 'Solidity',
        sources: {
            [contractFileName]: {
                content: contractFileContent,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    })));

    let contractAbi, contractByteCode;

    for (let contractName in contractCompileOutput.contracts[contractFileName]) {
        contractAbi = contractCompileOutput.contracts[contractFileName][contractName].abi;
        contractByteCode = contractCompileOutput.contracts[contractFileName][contractName].evm.bytecode.object;
    }

    if (!(contractAbi && contractByteCode)) {
        this.logger.Error('Contract compile failed!');
        return false;
    }

    return {contractAbi, contractByteCode};
}

module.exports = SolcHelper;
