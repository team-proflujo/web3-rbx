const Http = require('./helpers/Http');
const SolcHelper = require('./helpers/solcHelper');
const ABIHelper = require('./helpers/ABIHelper');
const { Logger, LoggerType } = require('./helpers/logger');

const defaultRubixAPIBaseURL = 'http://localhost:20000';

const RbxContract = function(rpcEndpoint, account, contractFileContent, contractAddress = false) {
    // Initialize Logger
    this.Logger = new Logger(LoggerType.ALL);
    // Do not show logs by default
    this.Logger.Pause();

    this.__http = new Http(this.Logger);
    this.__solc = new SolcHelper(this.Logger);
    this.__abi = new ABIHelper(this.Logger);

    this.rpcEndpoint = rpcEndpoint || defaultRubixAPIBaseURL;
    this.account = account;
    this.contractFileContent = contractFileContent;

    // TODO: Multiple contract class in single sol file

    if (contractAddress) {
        this.contractAddress = contractAddress;
    }
};

RbxContract.prototype.deploy = async function(constructorArgs) {
    const {contractAbi, contractByteCode} = this.__solc.CompileContract(this.contractFileContent);

    let constructorParams = this.__abi.PrepareMethodSignature(contractAbi, 'constructor', constructorArgs);

    let { success, message, response, error } = await this.__requestRPC(this.rpcEndpoint, '/api/contract/deploy', 'post', {
        account: this.account,
        byteCode: (contractByteCode.startsWith('0x') ? contractByteCode : ('0x' + contractByteCode)),
        params: (constructorParams ? `0x${constructorParams}` : '' ),
    });

    if (success) {
        if (!message) {
            message = 'Contract deployed successfully.';
        }

        this.Logger.Info(message);

        this.contractAddress = response.data.contractAddress;

        return this.contractAddress;
    } else {
        if (!message) {
            message = 'Failed to deploy the Contract.';
        }

        this.Logger.Error(message, '\n\nError:', error);
    }

    return false;
}

RbxContract.prototype.call = async function(methodToCall, methodArgs = []) {
    const {contractAbi, contractByteCode} = this.__solc.CompileContract(this.contractFileContent);
    const reqData =  this.__abi.PrepareMethodSignature(contractAbi, methodToCall, methodArgs);

    if (!reqData) {
        return;
    }

    let { success, message, response, error } = await this.__requestRPC(this.rpcEndpoint, '/api/contract/call', 'post', {
        account: this.account,
        contractAddress: (this.contractAddress.startsWith('0x') ? this.contractAddress : ('0x' + this.contractAddress)),
        params: reqData,
    });

    if (success) {
        if (!message) {
            message = 'Contract method executed successfully.';
        }

        this.Logger.Info(message);

        return this.__abi.ParseMethodResult(contractAbi, methodToCall, methodArgs, response.data.result);
    } else {
        if (!message) {
            message = 'Failed to execute the Contract method.';
        }

        this.Logger.Error(message, '\n\nError:', error);
    }

    return false;
}

RbxContract.prototype.getCode = async function() {
    let { success, message, response, error } = await this.__requestRPC(this.rpcEndpoint, '/api/contract/code', 'get', {
        account: this.account,
        contractAddress: (this.contractAddress.startsWith('0x') ? this.contractAddress : ('0x' + this.contractAddress)),
    });

    if (success) {
        return response.data.byteCode;
    } else {
        if (!message) {
            message = 'Failed to get the Contract code.';
        }

        this.Logger.Error(message, '\n\nError:', error);
    }

    return false;
}

RbxContract.prototype.__requestRPC = async function(url, method, data) {
    // this.Logger.Info('req data:', data);

    return this.__processRPCResponse(await this.__http.Send(this.__http.FormatURL(this.rpcEndpoint, url), method, data));
}

RbxContract.prototype.__processRPCResponse = function(res) {
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
