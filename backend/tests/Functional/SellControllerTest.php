<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use App\Entity\Wallet;
use App\Entity\Cryptocurrency;
use App\Entity\Quote;
use App\Entity\Transaction;
use Doctrine\ORM\EntityManagerInterface;

class SellControllerTest extends WebTestCase
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
     * Helper method to create and persist a user with a wallet.
     * Avoids code duplication across tests.
     */
    private function createUserWithWallet(string $email, string $balance): array
    {
        $user = new User();
        $user->setFirstname('Test');
        $user->setLastname('Seller');
        $user->setEmail($email);
        $user->setRole('user'); // Must be 'user' or 'admin', not 'ROLE_USER'
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance($balance);
        $user->setWallet($wallet);

        $this->em->persist($user);
        $this->em->persist($wallet);

        return [$user, $wallet];
    }

    /**
     * Helper method to create and persist a cryptocurrency with a quote.
     */
    private function createCryptoWithQuote(string $name, string $symbol, string $price): array
    {
        $crypto = new Cryptocurrency();
        $crypto->setName($name);
        $crypto->setSymbol($symbol);

        $quote = new Quote();
        $quote->setPrice($price);
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        $this->em->persist($crypto);
        $this->em->persist($quote);

        return [$crypto, $quote];
    }

    /**
     * Helper method to create and persist a buy transaction.
     * Used to simulate that the user already owns some cryptocurrency.
     */
    private function createBuyTransaction(Wallet $wallet, Cryptocurrency $crypto, string $quantity, string $price): Transaction
    {
        $transaction = new Transaction();
        $transaction->setWallet($wallet);
        $transaction->setCryptocurrency($crypto);
        $transaction->setType('buy');
        $transaction->setQuantity($quantity);
        $transaction->setUnitPriceEur($price);
        $wallet->addTransaction($transaction);

        $this->em->persist($transaction);

        return $transaction;
    }

    /**
     * Test that a request without the X-User-Id header returns 401 Unauthorized.
     */
    public function testSellWithoutUserIdHeader(): void
    {
        $this->client->request(
            'POST',
            '/api/sell',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'cryptoId' => 1,
                'quantity' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(401);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Unauthorized', $data['message']);
    }

    /**
     * Test a successful sale:
     * - User has a wallet with 100€
     * - User owns 2 BTC (via a prior buy transaction at 500€ each)
     * - Sells 1 BTC at current price of 500€
     * - Expects 201 with new balance of 600€ (100 + 500)
     */
    public function testSellSuccessful(): void
    {
        [$user, $wallet] = $this->createUserWithWallet('sell@example.com', '100');
        [$crypto] = $this->createCryptoWithQuote('Bitcoin', 'BTC', '500');

        // Simulate owning 2 BTC via a prior purchase
        $this->createBuyTransaction($wallet, $crypto, '2', '500');

        $this->em->flush();

        // Sell 1 BTC at current price of 500€
        $this->client->request(
            'POST',
            '/api/sell',
            [],
            [],
            [
                'CONTENT_TYPE'   => 'application/json',
                'HTTP_X-USER-ID' => $user->getId()
            ],
            json_encode([
                'cryptoId' => $crypto->getId(),
                'quantity' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        $data = json_decode($this->client->getResponse()->getContent(), true);

        // Assert the response message
        $this->assertEquals('Sale successful', $data['message']);

        // Assert the balance was correctly credited: 100 + (500 * 1) = 600
        $this->assertEquals(600.0, $data['newBalance']);

        // Assert the sale details are correct
        $this->assertEquals('Bitcoin', $data['crypto']);
        $this->assertEquals(1, $data['quantity']);
        $this->assertEquals(500.0, $data['unitPrice']);
        $this->assertEquals(500.0, $data['totalReceived']);
    }

    /**
     * Test that selling more crypto than owned returns 400 Insufficient crypto balance.
     */
    public function testSellWithInsufficientCryptoBalance(): void
    {
        [$user, $wallet] = $this->createUserWithWallet('sellpoor@example.com', '100');
        [$crypto] = $this->createCryptoWithQuote('Ethereum', 'ETH', '300');

        // User only owns 1 ETH
        $this->createBuyTransaction($wallet, $crypto, '1', '300');

        $this->em->flush();

        // Attempt to sell 5 ETH when only 1 is owned
        $this->client->request(
            'POST',
            '/api/sell',
            [],
            [],
            [
                'CONTENT_TYPE'   => 'application/json',
                'HTTP_X-USER-ID' => $user->getId()
            ],
            json_encode([
                'cryptoId' => $crypto->getId(),
                'quantity' => 5
            ])
        );

        $this->assertResponseStatusCodeSame(400);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Insufficient crypto balance', $data['message']);
        $this->assertEquals(1.0, $data['owned']);
    }

    /**
     * Test that selling with an invalid user ID returns 404.
     */
    public function testSellWithInvalidUserId(): void
    {
        $this->client->request(
            'POST',
            '/api/sell',
            [],
            [],
            [
                'CONTENT_TYPE'   => 'application/json',
                'HTTP_X-USER-ID' => 99999 // Non-existent user ID
            ],
            json_encode([
                'cryptoId' => 1,
                'quantity' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(404);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('User not found', $data['message']);
    }

    /**
     * Test that selling with invalid data (missing fields) returns 400.
     */
    public function testSellWithInvalidData(): void
    {
        [$user] = $this->createUserWithWallet('validuser@example.com', '1000');
        $this->em->flush();

        // Send request with empty body
        $this->client->request(
            'POST',
            '/api/sell',
            [],
            [],
            [
                'CONTENT_TYPE'   => 'application/json',
                'HTTP_X-USER-ID' => $user->getId()
            ],
            json_encode([]) // Missing cryptoId and quantity
        );

        $this->assertResponseStatusCodeSame(400);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Invalid data', $data['message']);
    }

    /**
     * Test that selling a non-existent cryptocurrency returns 404.
     */
    public function testSellWithInvalidCryptoId(): void
    {
        [$user] = $this->createUserWithWallet('sellcrypto@example.com', '1000');
        $this->em->flush();

        $this->client->request(
            'POST',
            '/api/sell',
            [],
            [],
            [
                'CONTENT_TYPE'   => 'application/json',
                'HTTP_X-USER-ID' => $user->getId()
            ],
            json_encode([
                'cryptoId' => 99999, // Non-existent crypto ID
                'quantity' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(404);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Cryptocurrency not found', $data['message']);
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