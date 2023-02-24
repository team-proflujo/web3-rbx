const { Http, formatURL } = require('./helpers/Http');
const solcHelper = require('./helpers/solcHelper');
const abiHelper = require('./helpers/ABIHelper');

const rubixAPIBaseURL = 'http://localhost:8545';

async function requestRPC(url, method, data) {
    data['id'] = 1;
    data['jsonrpc'] = '2.0';
    console.log('req data:', data);

    return processRPCResponse(await Http(formatURL(rubixAPIBaseURL, url), method, data));
}

function processRPCResponse(res) {
    let { success, response, error } = res;

    if (success) {
        if (response.data.error) {
            success = false;
            error = response.data.error;
        }
    } else {
        //
    }

    return {success, response, error};
}

// only for ethereum
async function unlockAccount(account, password) {
    let { success, response, error } = await requestRPC('', 'post', {
        method: 'personal_unlockAccount',
        params: [
            account, password, 3600,
        ],
    });

    if (success) {
        console.log('Account unlocked.');
    } else {
        console.log('Error when unlocking Account:', error);
    }

    return success;
}

// @param password is only for Ethereum
async function deploy(account, password, contractFilePath, contractClassName, constructorArgs) {
    if (!await unlockAccount(account, password)) {
        return;
    }

    const {contractAbi, contractByteCode} = await solcHelper.getCompiledContractData(contractFilePath, contractClassName);

    let { success, response, error } = await requestRPC('', 'post', {
        method: 'eth_sendTransaction',
        params: [
            {
                from: (account.startsWith('0x') ? account : ('0x' + account)),
                data: (contractByteCode.startsWith('0x') ? contractByteCode : ('0x' + contractByteCode)) + (abiHelper.prepareMethodSignature(contractAbi, 'constructor', constructorArgs) || ''),
            }
        ],
    });

    if (success) {
        // Txn receipt for Ethereum
        const txnReceipt = response.data.result;

        console.log('Contract Deployment initiated! Transaction receipt:', txnReceipt);

        // TODO: return contract address when implementing Rubix RPC
        return txnReceipt;
    } else {
        console.log('Error when Deploying Contract:', error);
    }

    return false;
}

async function call(account, password, contractFilePath, contractClassName, contractAddress, methodToCall, methodArgs) {
    // unlock account when call incase store method is called
    if (!await unlockAccount(account, password)) {
        return;
    }

    const {contractAbi, contractByteCode} = await solcHelper.getCompiledContractData(contractFilePath, contractClassName);
    const reqData =  abiHelper.prepareMethodSignature(contractAbi, methodToCall, methodArgs);

    if (!reqData) {
        return;
    }

    let { success, response, error } = await requestRPC('', 'post', {
        method: 'eth_call',
        params: [
            {
                from: (account.startsWith('0x') ? account : ('0x' + account)),
                to: (contractAddress.startsWith('0x') ? contractAddress : ('0x' + contractAddress)),
                data: reqData,
            },
            'latest',
        ],
    });

    if (success) {
        console.log('Contract method executed successfully.');

        return abiHelper.parseMethodResult(contractAbi, methodToCall, methodArgs, response.data.result);
    } else {
        console.log('Error when calling Contract method:', error);
    }

    return false;
}

const RbxContract = function(account, password, contractFilePath, contractClassName) {
    this.account = account;
    this.password = password;
    this.contractFilePath = contractFilePath;
    this.contractClassName = contractClassName;
};

RbxContract.prototype.deploy = async function(constructorArgs) {
    return await deploy(this.account, this.password, this.contractFilePath, this.contractClassName, constructorArgs);
}

RbxContract.prototype.call = async function(contractAddress, methodToCall, methodArgs = []) {
    return await call(this.account, this.password, this.contractFilePath, this.contractClassName, contractAddress, methodToCall, methodArgs);
}

module.exports = RbxContract;
