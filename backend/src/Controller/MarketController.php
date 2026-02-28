<?php

namespace App\Controller;

use App\Repository\CryptocurrencyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class MarketController extends AbstractController
{
    #[Route('/market', name: 'api_market', methods: ['GET'])]
    public function getMarket(CryptocurrencyRepository $cryptoRepo): JsonResponse
    {
        $cryptos = $cryptoRepo->findAll();
        $result = [];

        foreach ($cryptos as $crypto) {
            $quotes = $crypto->getQuotes()->toArray();
            usort($quotes, fn($a, $b) => $b->getQuotedAt() <=> $a->getQuotedAt());

            $currentPrice  = !empty($quotes) ? (float) $quotes[0]->getPrice() : 0;
            $previousPrice = count($quotes) > 1 ? (float) $quotes[1]->getPrice() : $currentPrice;
            $change = $previousPrice > 0
                ? round((($currentPrice - $previousPrice) / $previousPrice) * 100, 2)
                : 0;

            $result[] = [
                'id'            => $crypto->getId(),
                'name'          => $crypto->getName(),
                'symbol'        => $crypto->getSymbol(),
                'currentPrice'  => $currentPrice,
                'previousPrice' => $previousPrice,
                'change'        => $change,
            ];
        }

        return $this->json($result);
    }

    #[Route('/market/{id}/history', name: 'api_market_history', methods: ['GET'])]
    public function getHistory(int $id, CryptocurrencyRepository $cryptoRepo): JsonResponse
    {
        $crypto = $cryptoRepo->find($id);

        if (!$crypto) {
            return $this->json(['message' => 'Cryptocurrency not found'], 404);
        }

        $quotes = $crypto->getQuotes()->toArray();
        usort($quotes, fn($a, $b) => $a->getQuotedAt() <=> $b->getQuotedAt());

        // Derniers 30 jours
        $quotes = array_slice($quotes, -30);

        $history = array_map(fn($q) => [
            'date'  => $q->getQuotedAt()->format('M d'),
            'price' => (float) $q->getPrice(),
        ], $quotes);

        return $this->json($history);
    }
}