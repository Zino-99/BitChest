<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use App\Entity\Wallet;
use App\Entity\Cryptocurrency;
use App\Entity\Quote;
use App\Entity\Transaction;
use Doctrine\ORM\EntityManagerInterface;

class BuyControllerTest extends WebTestCase
{
    private $client;
    private $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = self::getContainer()->get(EntityManagerInterface::class);
    }

    public function testBuyWithoutUserIdHeader()
    {
        $this->client->request('POST', '/api/buy', [], [], ['CONTENT_TYPE' => 'application/json'], json_encode([
            'cryptoId' => 1,
            'quantity' => 1
        ]));

        $this->assertResponseStatusCodeSame(401);
        $this->assertStringContainsString('Unauthorized', $this->client->getResponse()->getContent());
    }

    public function testBuySuccessful()
    {
        // Crée user + wallet
        $user = new User();
        $user->setFirstname('Test');
        $user->setLastname('Buyer');
        $user->setEmail('buy@example.com');
        $user->setRole('ROLE_USER');
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance('1000');
        $user->setWallet($wallet);

        // Crée crypto + quote
        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');

        $quote = new Quote();
        $quote->setPrice('500');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->flush();

        $this->client->request('POST', '/api/buy', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X-USER-ID' => $user->getId()
        ], json_encode([
            'cryptoId' => $crypto->getId(),
            'quantity' => 1
        ]));

        $response = $this->client->getResponse();
        $this->assertResponseStatusCodeSame(201);
        $this->assertStringContainsString('Purchase successful', $response->getContent());
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->em->close();
        $this->em = null;
    }
}