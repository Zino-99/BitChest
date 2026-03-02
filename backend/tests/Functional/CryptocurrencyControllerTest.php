<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\Cryptocurrency;
use Doctrine\ORM\EntityManagerInterface;

class CryptocurrencyControllerTest extends WebTestCase
{
    private $client;
    private $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = self::getContainer()->get(EntityManagerInterface::class);
    }

    public function testListCryptos()
    {
        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');
        $this->em->persist($crypto);
        $this->em->flush();

        $this->client->request('GET', '/api/cryptocurrencies');
        $response = $this->client->getResponse();
        $this->assertResponseIsSuccessful();

        $data = json_decode($response->getContent(), true);
        $this->assertIsArray($data);
        $this->assertEquals('BTC', $data[0]['symbol']);
    }
}