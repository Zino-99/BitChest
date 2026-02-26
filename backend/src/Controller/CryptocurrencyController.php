<?php

namespace App\Controller;

use App\Entity\Cryptocurrency;
use App\Repository\CryptocurrencyRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

final class CryptocurrencyController extends AbstractController
{
    #[Route('/api/cryptocurrencies', name: 'api_cryptocurrency_list', methods: ['GET'])]
    public function list(CryptocurrencyRepository $cryptoRepo): JsonResponse
    {
        $cryptos = $cryptoRepo->findAll();

        $data = array_map(function($crypto) {
            return [
                'id' => $crypto->getId(),
                'symbol' => $crypto->getSymbol(),
                'name' => $crypto->getName(),
            ];
        }, $cryptos);

        return $this->json($data);
    }
}