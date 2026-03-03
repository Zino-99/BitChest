<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use App\Entity\Wallet;
use App\Entity\Cryptocurrency;
use App\Entity\Quote;
use App\Entity\Transaction;
use Doctrine\ORM\EntityManagerInterface;

class WalletControllerTest extends WebTestCase
{
    private $client;
    private $em;

    /**
     * Set up the test environment before each test.
     * Creates a fresh HTTP client and gets the EntityManager from the container.
     */
    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = self::getContainer()->get(EntityManagerInterface::class);
    }

    /**
     * Test that a request without the X-User-Id header returns 401 Unauthorized.
     */
    public function testWalletUnauthorized(): void
    {
        $this->client->request('GET', '/api/wallet');

        $this->assertResponseStatusCodeSame(401);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Non authentifié', $data['message']);
    }

    /**
     * Test that a request with a non-existent user ID returns 404.
     */
    public function testWalletUserNotFound(): void
    {
        $this->client->request('GET', '/api/wallet', [], [], [
            'HTTP_X-USER-ID' => 999999 // Non-existent user ID
        ]);

        $this->assertResponseStatusCodeSame(404);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Utilisateur introuvable', $data['message']);
    }

    /**
     * Test a successful wallet retrieval:
     * - Creates a user with a wallet (balance: 150€)
     * - Creates a cryptocurrency (BTC) with a current price of 50000€
     * - Creates a buy transaction of 0.1 BTC at 48000€
     * - Expects the response to contain the user info, balance, and crypto holdings
     */
    public function testWalletSuccessful(): void
    {
        // Create a user with role 'user' (not 'ROLE_USER')
        $user = new User();
        $user->setFirstname('Alice');
        $user->setLastname('Wallet');
        $user->setEmail('alice@example.com');
        $user->setRole('user');
        $user->setPassword('password');

        // Create a wallet with an initial balance of 150€
        $wallet = new Wallet($user);
        $wallet->setEuroBalance('150');
        $user->setWallet($wallet);

        // Create a cryptocurrency
        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');

        // Create a quote with the current price of 50000€
        $quote = new Quote();
        $quote->setPrice('50000');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        // Create a buy transaction: 0.1 BTC purchased at 48000€
        $transaction = new Transaction();
        $transaction->setWallet($wallet);
        $transaction->setCryptocurrency($crypto);
        $transaction->setType('buy');
        $transaction->setQuantity('0.1');
        $transaction->setUnitPriceEur('48000');
        $wallet->addTransaction($transaction);

        // Persist everything to the test database
        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->persist($transaction);
        $this->em->flush();

        // Send the GET request with the user ID in the header
        $this->client->request('GET', '/api/wallet', [], [], [
            'HTTP_X-USER-ID' => $user->getId()
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);

        // Assert user info is correct
        $this->assertEquals('Alice', $data['user']['firstname']);
        $this->assertEquals('Wallet', $data['user']['lastname']);

        // Assert the euro balance is correct
        $this->assertEquals(150.0, $data['euroBalance']);

        // Assert exactly one crypto entry is returned
        $this->assertCount(1, $data['cryptos']);

        $cryptoData = $data['cryptos'][0];

        // Assert the crypto details
        $this->assertEquals('Bitcoin', $cryptoData['name']);
        $this->assertEquals('BTC', $cryptoData['symbol']);
        $this->assertEquals(50000.0, $cryptoData['currentPrice']);

        // Assert exactly one purchase is listed
        $this->assertCount(1, $cryptoData['purchases']);

        $purchase = $cryptoData['purchases'][0];

        // Assert the purchase details
        $this->assertEquals(0.1, $purchase['quantity']);
        $this->assertEquals(48000.0, $purchase['priceAtPurchase']);
    }

    /**
     * Test that a user with a wallet but no transactions
     * returns an empty cryptos array.
     */
    public function testWalletWithNoTransactions(): void
    {
        // Create a user with an empty wallet
        $user = new User();
        $user->setFirstname('Bob');
        $user->setLastname('Empty');
        $user->setEmail('bob@example.com');
        $user->setRole('user');
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance('500');
        $user->setWallet($wallet);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->flush();

        $this->client->request('GET', '/api/wallet', [], [], [
            'HTTP_X-USER-ID' => $user->getId()
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);

        // Assert the balance is correct
        $this->assertEquals(500.0, $data['euroBalance']);

        // Assert no crypto holdings are returned
        $this->assertCount(0, $data['cryptos']);
    }

    /**
     * Test that sell transactions are ignored when building the cryptos list.
     * Only 'buy' transactions should appear in the wallet response.
     */
    public function testWalletOnlyShowsBuyTransactions(): void
    {
        $user = new User();
        $user->setFirstname('Charlie');
        $user->setLastname('Seller');
        $user->setEmail('charlie@example.com');
        $user->setRole('user');
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance('200');
        $user->setWallet($wallet);

        $crypto = new Cryptocurrency();
        $crypto->setName('Ethereum');
        $crypto->setSymbol('ETH');

        $quote = new Quote();
        $quote->setPrice('2000');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        // Create one buy transaction
        $buyTransaction = new Transaction();
        $buyTransaction->setWallet($wallet);
        $buyTransaction->setCryptocurrency($crypto);
        $buyTransaction->setType('buy');
        $buyTransaction->setQuantity('1');
        $buyTransaction->setUnitPriceEur('1800');
        $wallet->addTransaction($buyTransaction);

        // Create one sell transaction (should NOT appear in cryptos list)
        $sellTransaction = new Transaction();
        $sellTransaction->setWallet($wallet);
        $sellTransaction->setCryptocurrency($crypto);
        $sellTransaction->setType('sell');
        $sellTransaction->setQuantity('0.5');
        $sellTransaction->setUnitPriceEur('2000');
        $wallet->addTransaction($sellTransaction);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->persist($buyTransaction);
        $this->em->persist($sellTransaction);
        $this->em->flush();

        $this->client->request('GET', '/api/wallet', [], [], [
            'HTTP_X-USER-ID' => $user->getId()
        ]);

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);

        // Only one crypto entry should exist (grouped by buy transactions only)
        $this->assertCount(1, $data['cryptos']);

        // Only the buy transaction should appear in purchases
        $this->assertCount(1, $data['cryptos'][0]['purchases']);
        $this->assertEquals(1.0, $data['cryptos'][0]['purchases'][0]['quantity']);
    }

    /**
     * Clean up the database after each test to avoid data conflicts
     * between test runs (e.g. unique constraint violations).
     */
    protected function tearDown(): void
    {
        $this->em->createQuery('DELETE FROM App\Entity\Transaction t')->execute();
        $this->em->createQuery('DELETE FROM App\Entity\Quote q')->execute();
        $this->em->createQuery('DELETE FROM App\Entity\Wallet w')->execute();
        $this->em->createQuery('DELETE FROM App\Entity\Cryptocurrency c')->execute();
        $this->em->createQuery('DELETE FROM App\Entity\User u')->execute();

        parent::tearDown();
        $this->em->close();
        $this->em = null;
    }
}