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

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = self::getContainer()->get(EntityManagerInterface::class);
    }

    public function testSellSuccessful()
    {
        $user = new User();
        $user->setFirstname('Test');
        $user->setLastname('Seller');
        $user->setEmail('sell@example.com');
        $user->setRole('ROLE_USER');
        $user->setPassword('password');

        $wallet = new Wallet($user);
        $wallet->setEuroBalance('100');
        $user->setWallet($wallet);

        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');

        $quote = new Quote();
        $quote->setPrice('500');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        // Transaction d'achat pour posséder de la crypto
        $buyTransaction = new Transaction();
        $buyTransaction->setWallet($wallet);
        $buyTransaction->setCryptocurrency($crypto);
        $buyTransaction->setType('buy');
        $buyTransaction->setQuantity('2');
        $buyTransaction->setUnitPriceEur('500');
        $wallet->addTransaction($buyTransaction);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->persist($buyTransaction);
        $this->em->flush();

        $this->client->request('POST', '/api/sell', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X-USER-ID' => $user->getId()
        ], json_encode([
            'cryptoId' => $crypto->getId(),
            'quantity' => 1
        ]));

        $this->assertResponseStatusCodeSame(201);
        $this->assertStringContainsString('Sale successful', $this->client->getResponse()->getContent());
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->em->close();
        $this->em = null;
    }
}