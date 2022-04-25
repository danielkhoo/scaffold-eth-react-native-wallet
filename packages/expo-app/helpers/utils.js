
import { ethers } from "ethers";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAccessControlOptions, loadKeychainValue, saveKeychainValue } from './keychain'

export const truncateAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export const loadOrGenerateWallet = async () => {
    console.log('loadOrGenerateWallet');
    const accessControlOptions = await getAccessControlOptions();

    const pk = await loadKeychainValue('activePrivateKey')
    if (!pk) {
        const generatedWallet = ethers.Wallet.createRandom();
        const newWalletAddress = generatedWallet.address
        const newPrivateKey = generatedWallet._signingKey().privateKey;

        await saveKeychainValue('activePrivateKey', newPrivateKey, accessControlOptions)
        await saveKeychainValue(newWalletAddress, newPrivateKey, accessControlOptions)
        console.log('set publicKeyList', [newWalletAddress]);
        await AsyncStorage.setItem('publicKeyList', JSON.stringify([newWalletAddress]))

        return generatedWallet
    } else {
        const existingWallet = new ethers.Wallet(pk);
        return existingWallet
    }
}
export const loadAllWalletAddresses = async () => {
    const addresses = JSON.parse(await AsyncStorage.getItem('publicKeyList'))
    return addresses
}

export const generateNewPrivateKeyAndWallet = async () => {
    try {
        const accessControlOptions = await getAccessControlOptions();
        const generatedWallet = ethers.Wallet.createRandom();
        const newWalletAddress = generatedWallet.address
        const newPrivateKey = generatedWallet._signingKey().privateKey;
        await saveKeychainValue('activePrivateKey', newPrivateKey, accessControlOptions)

        await saveKeychainValue(newWalletAddress, newPrivateKey, accessControlOptions)

        // Add new wallet address to the existing list
        const walletAddresses = await loadAllWalletAddresses()
        walletAddresses.push(newWalletAddress)
        await AsyncStorage.setItem('publicKeyList', JSON.stringify(walletAddresses))

        return { generatedWallet, walletAddresses }
    } catch (error) {

    }

}

export const switchActiveWallet = async (walletAddress) => {
    const accessControlOptions = await getAccessControlOptions();

    // Get private key from keychain
    const pk = await loadKeychainValue(walletAddress)

    // Save as active private key
    await saveKeychainValue('activePrivateKey', pk, accessControlOptions)
    return new ethers.Wallet(pk);
}

export const updateWalletAddresses = async (walletAddresses) => {
    await AsyncStorage.setItem('publicKeyList', JSON.stringify(walletAddresses))
}

