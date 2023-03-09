# WebRbx

Client side wrapper for Rubix RPC.

## How to Use

1. Install package: `npm install web3-rbx`.

2. Import in your code:

    ```js
    // Import module
    const RbxContract = require('web3-rbx');

    // Initialize Contract class
    const contract = RbxContract('RPC_ENDPOINT', 'ACCOUNT_ADDRESS', 'SOLIDITY_CONTRACT_CODE');
    ```

3. To Deploy:

    ```js
    const txnReceipt = await contract.deploy([/* constructor arguments if any */]);
    ```

4. To Call contract method:

    ```js
    const result = await contract.call('CONTRACT_ADDRESS', 'CONTRACT_METHOD', [/* method arguments if any */]);
    ```
