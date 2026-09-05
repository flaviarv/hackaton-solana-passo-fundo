import { 
  Connection, 
  Keypair, 
  PublicKey,
  clusterApiUrl, 
  Transaction, 
  SystemProgram, 
  sendAndConfirmTransaction 
} from '@solana/web3.js';
import { 
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  AccountState,
  getMintLen,
  getAssociatedTokenAddressSync,
  getAccount,
  createInitializeDefaultAccountStateInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeMintInstruction,
  getOrCreateAssociatedTokenAccount,
  createThawAccountInstruction,
  createBurnInstruction,
  mintTo
} from '@solana/spl-token';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import dotenv from 'dotenv';

dotenv.config();

function getPayerFromMnemonic() {
  const mnemonic = process.env.SOLANA_MNEMONIC;
  if (!mnemonic) {
    throw new Error('SOLANA_MNEMONIC não configurada no arquivo .env');
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic.trim());
  const path = "m/44'/501'/0'/0'";
  const derivedSeed = derivePath(path, seed.toString('hex')).key;
  return Keypair.fromSeed(derivedSeed);
}

export async function mintarTokenSojaPermissionado({
  toneladasSoja,
  valorTonelada,
  cnpjExportador,
  paisOrigem,
  paisDestino
}) {
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
  const payer = getPayerFromMnemonic();
  const mintKeypair = Keypair.generate();

  // 1. Extensões de conformidade institucional
  const extensions = [
    ExtensionType.DefaultAccountState,
    ExtensionType.PermanentDelegate
  ];

  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  // 2. Criar e inicializar a conta Mint com restrições do Token-2022
  const txCriarMint = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeDefaultAccountStateInstruction(
      mintKeypair.publicKey,
      AccountState.Frozen,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializePermanentDelegateInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      0, // Decimais zero: cada token representa 1 tonelada inteira
      payer.publicKey,
      payer.publicKey,
      TOKEN_2022_PROGRAM_ID
    )
  );

  await sendAndConfirmTransaction(connection, txCriarMint, [payer, mintKeypair]);

  // 3. Obter ou criar a conta de token associada (ATA)
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mintKeypair.publicKey,
    payer.publicKey,
    false,
    'confirmed',
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // 4. Descongelar temporariamente a conta para permitir o crédito inicial
  const thawTx = new Transaction().add(
    createThawAccountInstruction(
      tokenAccount.address,
      mintKeypair.publicKey,
      payer.publicKey,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );
  await sendAndConfirmTransaction(connection, thawTx, [payer]);

  // 5. Emitir os tokens correspondentes ao lote
  const quantidadeTokens = BigInt(toneladasSoja);
  const signature = await mintTo(
    connection,
    payer,
    mintKeypair.publicKey,
    tokenAccount.address,
    payer.publicKey,
    quantidadeTokens,
    [],
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  return {
    success: true,
    mintAddress: mintKeypair.publicKey.toBase58(),
    tokenAccount: tokenAccount.address.toBase58(),
    signature,
    tokensGerados: toneladasSoja,
    padrao: 'Solana Token-2022 Permissioned (Frozen by Default)',
    detalhesLote: {
      cnpjExportador,
      valorTonelada,
      paisOrigem,
      paisDestino
    }
  };
}

export async function queimarTokenSoja({ mintAddress, quantidadeTokens }) {
  const connection = new Connection(clusterApiUrl('testnet'), 'confirmed');
  const payer = getPayerFromMnemonic();
  const mintPubkey = new PublicKey(mintAddress);

  // 1. Obter endereço da conta de token associada (ATA)
  const tokenAccountAddress = getAssociatedTokenAddressSync(
    mintPubkey,
    payer.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  // 2. Inspecionar o estado atual da conta na blockchain
  const tokenAccountInfo = await getAccount(
    connection,
    tokenAccountAddress,
    'confirmed',
    TOKEN_2022_PROGRAM_ID
  );

  const transaction = new Transaction();

  // 3. Descongelar APENAS se a conta estiver de fato congelada
  if (tokenAccountInfo.state === AccountState.Frozen) {
    transaction.add(
      createThawAccountInstruction(
        tokenAccountAddress,
        mintPubkey,
        payer.publicKey,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );
  }

  // 4. Instrução de Burn
  transaction.add(
    createBurnInstruction(
      tokenAccountAddress,
      mintPubkey,
      payer.publicKey,
      BigInt(quantidadeTokens),
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  // 5. Enviar e confirmar a transação na Testnet
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );

  return {
    success: true,
    signature,
    mintAddress,
    quantidadeQueimada: quantidadeTokens
  };
}