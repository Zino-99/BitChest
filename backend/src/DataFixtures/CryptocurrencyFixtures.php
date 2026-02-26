<?php

namespace App\DataFixtures;

use App\Entity\Cryptocurrency;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CryptocurrencyFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $cryptos = [
            ["BTC", "Bitcoin"],
            ["ETH", "Ethereum"],
            ["XRP", "Ripple"],
            ["BCH", "Bitcoin Cash"],
            ["ADA", "Cardano"],
            ["LTC", "Litecoin"],
            ["DASH", "Dash"],
            ["IOTA", "Iota"],
            ["NEM", "NEM"],
            ["XLM", "Stellar"],
        ];

        foreach ($cryptos as [$symbol, $name]) {
            $crypto = new Cryptocurrency();
            $crypto->setSymbol($symbol);
            $crypto->setName($name);

            $manager->persist($crypto);
        }

        $manager->flush();
    }
}