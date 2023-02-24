const solc = require('solc');
const fs = require('fs');
const path = require('path');

async function compileContract(contractFilePath, contractClassName) {
    const contractDirPath = contractFilePath.split('/').slice(0, -1).join('/');
    const contractFileName = path.basename(contractFilePath);
    const abiFileName = contractFileName.split('.').slice(0, -1).join('.') + '.abi';
    const bytecodeFileName = contractFileName.split('.').slice(0, -1).join('.') + '.bin';

    if (!contractClassName) {
        contractClassName = contractFileName.split('.')[0];
    }

    console.log(`Reading ${contractFileName} contract file...`);

    let contractFileContent = fs.readFileSync(contractFilePath).toString();

    console.log(`Compiling the contract...`);

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

    const contractAbi = contractCompileOutput.contracts[contractFileName][contractClassName].abi;
    const contractByteCode = contractCompileOutput.contracts[contractFileName][contractClassName].evm.bytecode.object;

    if (!(contractAbi && contractByteCode)) {
        console.error('Contract compile failed!');
        return false;
    }

    fs.writeFileSync(`${contractDirPath}/${abiFileName}`, JSON.stringify(contractAbi, null, 4));

    console.log(`Abi file can be found at: ${contractDirPath}/${abiFileName}`);

    fs.writeFileSync(`${contractDirPath}/${bytecodeFileName}`, JSON.stringify(contractByteCode, null, 4).replace(/\"/g, ''));

    console.log(`Byte code file can be found at: ${contractDirPath}/${bytecodeFileName}`);

    return {contractAbi, contractByteCode};
}

async function getCompiledContractData(contractFilePath, contractClassName) {
    const contractDirPath = contractFilePath.split('/').slice(0, -1).join('/');
    const contractFileName = path.basename(contractFilePath);
    const abiFile = contractDirPath + '/' + contractFileName.split('.').slice(0, -1).join('.') + '.abi';
    const bytecodeFile = contractDirPath + '/' + contractFileName.split('.').slice(0, -1).join('.') + '.bin';
    let contractAbi, contractByteCode;

    if (fs.existsSync(abiFile) && fs.lstatSync(abiFile).isFile() && fs.existsSync(bytecodeFile) && fs.lstatSync(bytecodeFile).isFile()) {
        contractAbi = JSON.parse(fs.readFileSync(abiFile).toString())
        contractByteCode = fs.readFileSync(bytecodeFile).toString()
    } else {
        ({contractAbi, contractByteCode} = await compileContract(contractFilePath, contractClassName));
    }

    return { contractAbi, contractByteCode };
}

module.exports = {
    compileContract,
    getCompiledContractData
};