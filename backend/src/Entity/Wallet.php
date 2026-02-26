<?php

namespace App\Entity;

use App\Repository\WalletRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: WalletRepository::class)]
#[ORM\Table(name: 'wallet')]
class Wallet
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(inversedBy: 'wallet')]
    #[ORM\JoinColumn(nullable: false)]
    private User $user;  // ← Pas de ?, jamais null en BDD

    #[ORM\Column(type: Types::DECIMAL, precision: 18, scale: 2, options: ['default' => '500.00'])]
    private string $euroBalance = '500.00';

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    /**
     * @var Collection<int, Transaction>
     */
    #[ORM\OneToMany(targetEntity: Transaction::class, mappedBy: 'wallet')]
    private Collection $transactions;

    public function __construct(User $user)  // ← User obligatoire dès le départ
    {
        $this->user = $user;
        $this->createdAt = new \DateTimeImmutable();
        $this->transactions = new ArrayCollection();
    }

    // ----------------- Getters / Setters -----------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): User  // ← Pas de ?, toujours un User
    {
        return $this->user;
    }

    public function setUser(User $user): static  // ← Pas de ?, jamais null
    {
        $this->user = $user;
        return $this;
    }

    /**
     * Usage interne uniquement (pour la synchronisation bidirectionnelle)
     * Ne persiste PAS en BDD avec user = null
     */


    public function getEuroBalance(): string
    {
        return $this->euroBalance;
    }

    public function setEuroBalance(string $euroBalance): static
    {
        $this->euroBalance = $euroBalance;
        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    /**
     * @return Collection<int, Transaction>
     */
    public function getTransactions(): Collection
    {
        return $this->transactions;
    }

    public function addTransaction(Transaction $transaction): static
    {
        if (!$this->transactions->contains($transaction)) {
            $this->transactions->add($transaction);
            $transaction->setWallet($this);
        }
        return $this;
    }

    public function removeTransaction(Transaction $transaction): static
    {
        if ($this->transactions->removeElement($transaction)) {
            if ($transaction->getWallet() === $this) {
                $transaction->setWallet(null);
            }
        }
        return $this;
    }
}