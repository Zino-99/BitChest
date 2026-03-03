<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use App\Entity\Wallet;
use App\Entity\Cryptocurrency;
use App\Entity\Quote;
use Doctrine\ORM\EntityManagerInterface;

class BuyControllerTest extends WebTestCase
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
    public function testBuyWithoutUserIdHeader(): void
    {
        $this->client->request(
            'POST',
            '/api/buy',
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
     * Test a successful purchase:
     * - Creates a user with a wallet (balance: 1000€)
     * - Creates a cryptocurrency with a quote (price: 500€)
     * - Sends a buy request for 1 unit
     * - Expects 201 with updated balance of 500€
     */
    public function testBuySuccessful(): void
    {
        // Create a user with role 'user' (not 'ROLE_USER')
        $user = new User();
        $user->setFirstname('Test');
        $user->setLastname('Buyer');
        $user->setEmail('buy@example.com');
        $user->setRole('user');
        $user->setPassword('password');

        // Create a wallet with an initial balance of 1000€
        $wallet = new Wallet($user);
        $wallet->setEuroBalance('1000');
        $user->setWallet($wallet);

        // Create a cryptocurrency
        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');

        // Create a quote (current price: 500€)
        $quote = new Quote();
        $quote->setPrice('500');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        // Persist everything to the test database
        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->flush();

        // Send the buy request with the user ID in the header
        $this->client->request(
            'POST',
            '/api/buy',
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

        // Assert the response is 201 Created
        $this->assertResponseStatusCodeSame(201);

        $data = json_decode($this->client->getResponse()->getContent(), true);

        // Assert the response message
        $this->assertEquals('Purchase successful', $data['message']);

        // Assert the balance was correctly deducted: 1000 - (500 * 1) = 500
        $this->assertEquals(500.0, $data['newBalance']);

        // Assert the purchase details are correct
        $this->assertEquals('Bitcoin', $data['crypto']);
        $this->assertEquals(1, $data['quantity']);
        $this->assertEquals(500.0, $data['unitPrice']);
        $this->assertEquals(500.0, $data['totalCost']);
    }

    /**
     * Test that buying with an invalid user ID returns 404.
     */
    public function testBuyWithInvalidUserId(): void
    {
        $this->client->request(
            'POST',
            '/api/buy',
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
     * Test that buying with insufficient wallet balance returns 400.
     */
    public function testBuyWithInsufficientBalance(): void
    {
        // Create a user with a very low balance (1€)
        $user = new User();
        $user->setFirstname('Poor');
        $user->setLastname('Buyer');
        $user->setEmail('poor@example.com');
        $user->setRole('user');
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance('1'); // Only 1€ available
        $user->setWallet($wallet);

        // Create a cryptocurrency with a high price (500€)
        $crypto = new Cryptocurrency();
        $crypto->setName('Ethereum');
        $crypto->setSymbol('ETH');

        $quote = new Quote();
        $quote->setPrice('500');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->flush();

        // Attempt to buy 1 unit at 500€ with only 1€ balance
        $this->client->request(
            'POST',
            '/api/buy',
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

        $this->assertResponseStatusCodeSame(400);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Insufficient balance', $data['message']);
    }

    /**
     * Test that buying with invalid data (missing fields) returns 400.
     */
    public function testBuyWithInvalidData(): void
    {
        // Create a valid user to pass the authentication check
        $user = new User();
        $user->setFirstname('Valid');
        $user->setLastname('User');
        $user->setEmail('valid@example.com');
        $user->setRole('user');
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance('1000');
        $user->setWallet($wallet);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->flush();

        // Send request with missing cryptoId and quantity
        $this->client->request(
            'POST',
            '/api/buy',
            [],
            [],
            [
                'CONTENT_TYPE'   => 'application/json',
                'HTTP_X-USER-ID' => $user->getId()
            ],
            json_encode([]) // Empty body
        );

        $this->assertResponseStatusCodeSame(400);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Invalid data', $data['message']);
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