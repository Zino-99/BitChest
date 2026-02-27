<?php

namespace App\Controller;

use App\Repository\WalletRepository;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class WalletController extends AbstractController
{
    #[Route('/wallet', name: 'api_wallet', methods: ['GET'])]
    public function getWallet(
        Request $request,
        WalletRepository $walletRepository,
        UserRepository $userRepository
    ): JsonResponse {
        // Récupération de l'utilisateur depuis la session (cohérent avec le Login)
        $userData = $request->getSession()->get('user');

        if (!$userData) {
            return $this->json(['message' => 'Non authentifié'], 401);
        }

        $user = $userRepository->find($userData['id']);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur introuvable'], 404);
        }

        $wallet = $user->getWallet();

        if (!$wallet) {
            return $this->json(['message' => 'Portefeuille introuvable'], 404);
        }

        // Grouper les transactions par crypto (uniquement les achats "buy")
        $cryptoMap = [];

        foreach ($wallet->getTransactions() as $transaction) {
            if ($transaction->getType() !== 'buy') {
                continue;
            }

            $crypto = $transaction->getCryptocurrency();
            $cryptoId = $crypto->getId();

            if (!isset($cryptoMap[$cryptoId])) {
                // Récupérer le dernier cours (Quote) de cette crypto
                $quotes = $crypto->getQuotes()->toArray();
                usort($quotes, fn($a, $b) => $b->getQuotedAt() <=> $a->getQuotedAt());
                $latestPrice = !empty($quotes) ? (float) $quotes[0]->getPrice() : 0;

                $cryptoMap[$cryptoId] = [
                    'id'           => $cryptoId,
                    'name'         => $crypto->getName(),
                    'symbol'       => $crypto->getSymbol(),
                    'currentPrice' => $latestPrice,
                    'purchases'    => [],
                ];
            }

            $cryptoMap[$cryptoId]['purchases'][] = [
                'id'               => $transaction->getId(),
                'date'             => $transaction->getCreatedAt()->format('Y-m-d'),
                'quantity'         => (float) $transaction->getQuantity(),
                'priceAtPurchase'  => (float) $transaction->getUnitPriceEur(),
            ];
        }

        return $this->json([
            'user' => [
                'firstname' => $user->getFirstname(),
                'lastname'  => $user->getLastname(),
            ],
            'euroBalance' => (float) $wallet->getEuroBalance(),
            'cryptos'     => array_values($cryptoMap),
        ]);
    }
}