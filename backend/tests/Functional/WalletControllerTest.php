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

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = self::getContainer()->get(EntityManagerInterface::class);
    }

    public function testWalletUnauthorized()
    {
        $this->client->request('GET', '/api/wallet');
        $this->assertResponseStatusCodeSame(401);
        $this->assertStringContainsString('Non authentifié', $this->client->getResponse()->getContent());
    }

    public function testWalletUserNotFound()
    {
        $this->client->request('GET', '/api/wallet', [], [], ['HTTP_X-USER-ID' => 999999]);
        $this->assertResponseStatusCodeSame(404);
        $this->assertStringContainsString('Utilisateur introuvable', $this->client->getResponse()->getContent());
    }

    public function testWalletSuccessful()
    {
        // Crée un utilisateur
        $user = new User();
        $user->setFirstname('Alice');
        $user->setLastname('Wallet');
        $user->setEmail('alice@example.com');
        $user->setRole('ROLE_USER');
        $user->setPassword('password');

        // Crée le wallet en passant le user obligatoire
        $wallet = new Wallet($user);
        $wallet->setEuroBalance('150');
        $user->setWallet($wallet); // bidirectionnel

        // Crée une crypto et un quote
        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');

        $quote = new Quote();
        $quote->setPrice('50000');
        $quote->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote);

        // Crée une transaction buy
        $transaction = new Transaction();
        $transaction->setWallet($wallet);
        $transaction->setCryptocurrency($crypto);
        $transaction->setType('buy');
        $transaction->setQuantity('0.1');
        $transaction->setUnitPriceEur('48000');
        $wallet->addTransaction($transaction);

        // Persiste tout
        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->persist($crypto);
        $this->em->persist($quote);
        $this->em->persist($transaction);
        $this->em->flush();

        // Requête GET /api/wallet
        $this->client->request('GET', '/api/wallet', [], [], [
            'HTTP_X-USER-ID' => $user->getId()
        ]);

        $response = $this->client->getResponse();
        $this->assertResponseIsSuccessful();

        $data = json_decode($response->getContent(), true);

        $this->assertEquals('Alice', $data['user']['firstname']);
        $this->assertEquals(150, $data['euroBalance']);
        $this->assertCount(1, $data['cryptos']);

        $cryptoData = $data['cryptos'][0];
        $this->assertEquals('BTC', $cryptoData['symbol']);
        $this->assertEquals(50000, $cryptoData['currentPrice']);
        $this->assertCount(1, $cryptoData['purchases']);
        $this->assertEquals(0.1, $cryptoData['purchases'][0]['quantity']);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->em->close();
        $this->em = null;
    }
}