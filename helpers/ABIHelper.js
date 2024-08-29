const ethereumJsUtil = require('ethereumjs-util');
const ethersAbiCoder = new (require('@ethersproject/abi').AbiCoder)();

const ABIHelper = function(logger) {
    this.logger = logger;
}

ABIHelper.prototype.__getMethodEntryFromABI = function(contractAbi, method) {
    let methodEntry = contractAbi.filter(obj => (method === 'constructor' && obj.type === 'constructor') || (obj.name === method && obj.type === 'function'));

    if (methodEntry.length === 0) {
        this.logger.Error(`Error: Method "${method}" not found in the Contract!`);
        return false;
    } else {
        methodEntry = methodEntry[0];
    }

    if (['view', 'pure', 'nonpayable'].indexOf(methodEntry.stateMutability) === -1) {
        this.logger.Error('Error: Calling "payable method" is not implemented yet!');
        return false;
    }

    return methodEntry;
}

ABIHelper.prototype.PrepareMethodSignature = function(contractAbi, methodToCall, methodArgs) {
    let methodEntry = this.__getMethodEntryFromABI(contractAbi, methodToCall);

    if (!methodEntry) {
        return false;
    } else if (methodEntry.inputs.length !== methodArgs.length) {
        this.logger.Error('Error: Invalid number of arguments! You need to pass ' + methodEntry.inputs.length + ' arguments.');
        return false;
    }

    let inputTypes = [], paramsABI = '';

    if (methodEntry.inputs.length > 0) {
        let inputArguments = [];

        methodEntry.inputs.forEach((input, i) => {
            inputTypes.push(input.type);
            inputArguments.push(methodArgs[i]);
        });

        paramsABI = ethersAbiCoder.encode(inputTypes, inputArguments).replace('0x', '');
    }

    if (methodEntry.type === 'constructor') {
        return paramsABI;
    }

    let methodSignature = ethereumJsUtil.bufferToHex(ethereumJsUtil.keccak256( Buffer.from(methodToCall + '(' + inputTypes.join(',') + ')', 'utf-8') )).slice(0, 10) + paramsABI;

    return methodSignature;
}

ABIHelper.prototype.ParseMethodResult = function(methodToCall, methodArgs, methodResult) {
    let methodEntry = this.__getMethodEntryFromABI(methodToCall);

    if (!methodEntry) {
        return;
    }

    if (methodEntry.outputs.length === 0) {
        this.logger.Error('Method does not return any value!');
        return;
    }

    if (methodResult && methodResult.toLowerCase() !== '0x') {
        methodResult = methodResult.length >= 2 ? methodResult.slice(2) : methodResult;

        let decodedResult = ethersAbiCoder.decode(methodEntry.outputs, (methodResult.startsWith('0x') ? methodResult : '0x' + methodResult), false);
        let processedOutput = {};

        methodEntry.outputs.forEach((output, i) => {
            let decodedValue = decodedResult[i];

            processedOutput[i] = decodedValue === '0x' ? null : decodedValue;
        });

        if (Object.keys(processedOutput).length === 1) {
            processedOutput = processedOutput[0];
        }

        if (processedOutput) {
            this.logger.Info('Contract method Result:', processedOutput);

            return processedOutput;
        } else {
            this.logger.Error('Error: Unable to parse Method output!');
        }
    } else {
        this.logger.Error('Error: Empty value returned by method');
    }

    return false;
}

module.exports = ABIHelper;
