<?php

namespace App\Controller;

use App\Entity\Transaction;
use App\Repository\CryptocurrencyRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class SellController extends AbstractController
{
    #[Route('/sell', name: 'api_sell', methods: ['POST'])]
    public function sell(
        Request $request,
        UserRepository $userRepo,
        CryptocurrencyRepository $cryptoRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $userId = $request->headers->get('X-User-Id');
        if (!$userId) {
            return $this->json(['message' => 'Unauthorized'], 401);
        }

        $user = $userRepo->find($userId);
        if (!$user) {
            return $this->json(['message' => 'User not found'], 404);
        }

        $wallet = $user->getWallet();
        if (!$wallet) {
            return $this->json(['message' => 'Wallet not found'], 404);
        }

        $data     = json_decode($request->getContent(), true);
        $cryptoId = $data['cryptoId'] ?? null;
        $quantity = $data['quantity'] ?? null;

        if (!$cryptoId || !$quantity || $quantity <= 0) {
            return $this->json(['message' => 'Invalid data'], 400);
        }

        $crypto = $cryptoRepo->find($cryptoId);
        if (!$crypto) {
            return $this->json(['message' => 'Cryptocurrency not found'], 404);
        }

        // Calcule la quantité possédée (achats - ventes)
        $owned = 0;
        foreach ($wallet->getTransactions() as $transaction) {
            if ($transaction->getCryptocurrency()->getId() !== $crypto->getId()) continue;
            if ($transaction->getType() === 'buy') {
                $owned += (float) $transaction->getQuantity();
            } elseif ($transaction->getType() === 'sell') {
                $owned -= (float) $transaction->getQuantity();
            }
        }

        if ($quantity > $owned) {
            return $this->json([
                'message' => 'Insufficient crypto balance',
                'owned'   => $owned,
            ], 400);
        }

        // Récupère le cours actuel
        $quotes = $crypto->getQuotes()->toArray();
        usort($quotes, fn($a, $b) => $b->getQuotedAt() <=> $a->getQuotedAt());

        if (empty($quotes)) {
            return $this->json(['message' => 'No price available'], 400);
        }

        $currentPrice  = (float) $quotes[0]->getPrice();
        $totalReceived = $currentPrice * $quantity;

        // Crédite le solde EUR
        $newBalance = (float) $wallet->getEuroBalance() + $totalReceived;
        $wallet->setEuroBalance((string) round($newBalance, 2));

        // Crée la transaction sell
        $transaction = new Transaction();
        $transaction->setWallet($wallet);
        $transaction->setCryptocurrency($crypto);
        $transaction->setType('sell');
        $transaction->setQuantity((string) $quantity);
        $transaction->setUnitPriceEur((string) $currentPrice);

        $em->persist($transaction);
        $em->flush();

        return $this->json([
            'message'       => 'Sale successful',
            'crypto'        => $crypto->getName(),
            'quantity'      => $quantity,
            'unitPrice'     => $currentPrice,
            'totalReceived' => $totalReceived,
            'newBalance'    => $newBalance,
        ], 201);
    }
}