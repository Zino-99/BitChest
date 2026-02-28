<?php

namespace App\Command;

use App\Entity\Quote;
use App\Repository\CryptocurrencyRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:update-quotes',
    description: 'Generate a new daily quote for each cryptocurrency',
)]
class UpdateQuotesCommand extends Command
{
    public function __construct(
        private CryptocurrencyRepository $cryptoRepo,
        private EntityManagerInterface $em
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption(
            'watch',
            'w',
            InputOption::VALUE_NONE,
            'Run in a loop and update quotes every 30 seconds'
        );
    }

    private function getCotationFor(string $cryptoname): float
    {
        return ((rand(0, 99) > 40) ? 1 : -1)
            * ((rand(0, 99) > 49) ? ord(substr($cryptoname, 0, 1)) : ord(substr($cryptoname, -1)))
            * (rand(1, 10) * .01);
    }

    private function updateOnce(OutputInterface $output): void
    {
        $cryptos = $this->cryptoRepo->findAll();

        foreach ($cryptos as $crypto) {
            $quotes = $crypto->getQuotes()->toArray();
            usort($quotes, fn($a, $b) => $b->getQuotedAt() <=> $a->getQuotedAt());
            $lastPrice = !empty($quotes) ? (float) $quotes[0]->getPrice() : 1.0;

            $variation = $this->getCotationFor($crypto->getName());
            $newPrice  = max(0.01, $lastPrice + $variation);

            $quote = new Quote();
            $quote->setCryptocurrency($crypto);
            $quote->setPrice((string) round($newPrice, 8));
            $quote->setQuotedAt(new \DateTimeImmutable());
            $this->em->persist($quote);

            $output->writeln(sprintf(
                '  %s (%s): %.2f → %.2f',
                $crypto->getName(),
                $crypto->getSymbol(),
                $lastPrice,
                $newPrice
            ));
        }

        $this->em->flush();
        $output->writeln('<info>[' . date('H:i:s') . '] Quotes updated successfully.</info>');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $watch = $input->getOption('watch');

        if ($watch) {
            $output->writeln('<comment>Watch mode enabled — updating every 30 seconds. Press Ctrl+C to stop.</comment>');
            while (true) {
                $this->updateOnce($output);
                sleep(30);
            }
        } else {
            $this->updateOnce($output);
        }

        return Command::SUCCESS;
    }
}