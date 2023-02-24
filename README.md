# WebRbx

Web3 like script module, used to Deploy & Execute Smart Contracts in Rubix blockchain.

## How to Use

1. Install package: `npm install web-rbx`.

2. Import in your code:

    ```js
    // Import module
    const RbxContract = require('web-rbx');

    // Initialize Contract class
    const contract = RbxContract('ACCOUNT_ADDRESS', 'ACCOUNT_PASSWORD', 'PATH_TO_SOLC_FILE', 'CONTRACT_CLASS_NAME');
    ```

3. To Deploy:

    ```js
    const txnReceipt = await contract.deploy([/* constructor arguments if any */]);
    ```

4. To Call contract method:

    ```js
    const result = await contract.call('CONTRACT_ADDRESS', 'CONTRACT_METHOD', [/* method arguments if any */]);
    ```
