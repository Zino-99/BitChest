<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\Cryptocurrency;
use App\Entity\Quote;
use Doctrine\ORM\EntityManagerInterface;

class MarketControllerTest extends WebTestCase
{
    private $client;
    private $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em = self::getContainer()->get(EntityManagerInterface::class);
    }

    public function testGetMarket()
    {
        $crypto = new Cryptocurrency();
        $crypto->setName('Bitcoin');
        $crypto->setSymbol('BTC');

        $quote1 = new Quote();
        $quote1->setPrice('50000');
        $quote1->setQuotedAt(new \DateTimeImmutable('-1 day'));
        $crypto->addQuote($quote1);

        $quote2 = new Quote();
        $quote2->setPrice('51000');
        $quote2->setQuotedAt(new \DateTimeImmutable());
        $crypto->addQuote($quote2);

        $this->em->persist($crypto);
        $this->em->persist($quote1);
        $this->em->persist($quote2);
        $this->em->flush();

        $this->client->request('GET', '/api/market');
        $response = $this->client->getResponse();

        $this->assertResponseIsSuccessful();
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('BTC', $data[0]['symbol']);
        $this->assertEquals(51000, $data[0]['currentPrice']);
    }
}