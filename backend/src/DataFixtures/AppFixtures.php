<?php

namespace App\DataFixtures;

use App\Entity\Cryptocurrency;
use App\Entity\Quote;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    private const CRYPTOS = [
        'Bitcoin', 'Ethereum', 'Ripple', 'Bitcoin Cash',
        'Cardano', 'Litecoin', 'Dash', 'Iota', 'NEM', 'Stellar'
    ];

    // Valeur initiale de mise sur le marché
    private function getFirstCotation(string $cryptoname): float
    {
        return ord(substr($cryptoname, 0, 1)) + rand(0, 10);
    }

    // Variation journalière
    private function getCotationFor(string $cryptoname): float
    {
        return ((rand(0, 99) > 40) ? 1 : -1)
            * ((rand(0, 99) > 49) ? ord(substr($cryptoname, 0, 1)) : ord(substr($cryptoname, -1)))
            * (rand(1, 10) * .01);
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::CRYPTOS as $name) {
            $crypto = new Cryptocurrency();
            $crypto->setName($name);
            $crypto->setSymbol($this->makeSymbol($name));
            $manager->persist($crypto);

            // Cours initial
            $currentPrice = $this->getFirstCotation($name);

            // Génère 30 jours de quotes historiques
            $date = new \DateTimeImmutable('-30 days');
            for ($i = 0; $i < 30; $i++) {
                $variation = $this->getCotationFor($name);
                $currentPrice = max(0.01, $currentPrice + $variation);

                $quote = new Quote();
                $quote->setCryptocurrency($crypto);
                $quote->setPrice((string) round($currentPrice, 8));
                $quote->setQuotedAt($date->modify("+{$i} days"));
                $manager->persist($quote);
            }
        }

        $manager->flush();
    }

    private function makeSymbol(string $name): string
    {
        $map = [
            'Bitcoin'      => 'BTC',
            'Ethereum'     => 'ETH',
            'Ripple'       => 'XRP',
            'Bitcoin Cash' => 'BCH',
            'Cardano'      => 'ADA',
            'Litecoin'     => 'LTC',
            'Dash'         => 'DASH',
            'Iota'         => 'IOTA',
            'NEM'          => 'XEM',
            'Stellar'      => 'XLM',
        ];
        return $map[$name] ?? strtoupper(substr($name, 0, 3));
    }
}