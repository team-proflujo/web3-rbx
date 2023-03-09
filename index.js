const { Http, formatURL } = require('./helpers/Http');
const solcHelper = require('./helpers/solcHelper');
const abiHelper = require('./helpers/ABIHelper');

const defaultRubixAPIBaseURL = 'http://localhost:20000';

const RbxContract = function(rpcEndpoint, account, contractFileContent, contractAddress = false) {
    this.rpcEndpoint = rpcEndpoint || defaultRubixAPIBaseURL;
    this.account = account;
    this.contractFileContent = contractFileContent;

    // TODO: Multiple contract class in single sol file

    if (contractAddress) {
        this.contractAddress = contractAddress;
    }
};

RbxContract.prototype.deploy = async function(constructorArgs) {
    const {contractAbi, contractByteCode} = await solcHelper.compileContract(this.contractFileContent);

    let { success, message, response, error } = await requestRPC(this.rpcEndpoint, '/api/contract/deploy', 'post', {
        account: this.account,
        // TODO: Pass constructor params when Deploying
        // byteCode: (contractByteCode.startsWith('0x') ? contractByteCode : ('0x' + contractByteCode)) + (abiHelper.prepareMethodSignature(contractAbi, 'constructor', constructorArgs) || ''),
        byteCode: (contractByteCode.startsWith('0x') ? contractByteCode : ('0x' + contractByteCode)),
    });

    if (success) {
        if (!message) {
            message = 'Contract deployed successfully.';
        }

        console.log(message);

        this.contractAddress = response.data.contractAddress;

        return this.contractAddress;
    } else {
        if (!message) {
            message = 'Failed to deploy the Contract.';
        }

        console.error(message, '\n\nError:', error);
    }

    return false;
}

RbxContract.prototype.call = async function(methodToCall, methodArgs = []) {
    const {contractAbi, contractByteCode} = await solcHelper.compileContract(this.contractFileContent);
    const reqData =  abiHelper.prepareMethodSignature(contractAbi, methodToCall, methodArgs);

    if (!reqData) {
        return;
    }

    let { success, message, response, error } = await requestRPC(this.rpcEndpoint, '/api/contract/call', 'post', {
        account: this.account,
        contractAddress: (this.contractAddress.startsWith('0x') ? this.contractAddress : ('0x' + this.contractAddress)),
        data: reqData,
    });

    if (success) {
        if (!message) {
            message = 'Contract method executed successfully.';
        }

        console.log(message);

        return abiHelper.parseMethodResult(contractAbi, methodToCall, methodArgs, response.data.result);
    } else {
        if (!message) {
            message = 'Failed to execute the Contract method.';
        }

        console.error(message, '\n\nError:', error);
    }

    return false;
}

RbxContract.prototype.getCode = async function() {
    let { success, message, response, error } = await requestRPC(this.rpcEndpoint, '/api/contract/code', 'get', {
        account: this.account,
        contractAddress: (this.contractAddress.startsWith('0x') ? this.contractAddress : ('0x' + this.contractAddress)),
    });

    if (success) {
        return response.data.byteCode;
    } else {
        if (!message) {
            message = 'Failed to get the Contract code.';
        }

        console.error(message, '\n\nError:', error);
    }

    return false;
}

async function requestRPC(rpcEndpoint, url, method, data) {
    // console.log('req data:', data);

    return processRPCResponse(await Http(formatURL(rpcEndpoint, url), method, data));
}

function processRPCResponse(res) {
    let { success, response, error } = res, message = '';

    if (response && response.data) {
        message = response.data.message;
    }

    if (success) {
        if (response && response.data.success) {
            //
        } else {
            success = false;
        }
    }

    return {success, message, response, error};
}

module.exports = RbxContract;
