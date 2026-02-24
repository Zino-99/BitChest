<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'user')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const ROLE_ADMIN = 'admin';
    public const ROLE_USER = 'user';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\NotBlank]
    #[Assert\Email(message: "L'email '{{ value }}' n'est pas valide.")]
    private ?string $email = null;

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[Assert\NotBlank]
    private ?string $password = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: "Le prénom est obligatoire")]
    private ?string $firstname = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: "Le nom est obligatoire")]
    private ?string $lastname = null;

    #[ORM\Column(length: 20)]
    private string $role;

    #[ORM\Column]
    private \DateTimeImmutable $createdAt;

    #[ORM\OneToOne(inversedBy: 'user', cascade: ['persist', 'remove'])]
    private ?wallet $wallet = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->role = self::ROLE_USER; // valeur par défaut
    }

    // ----------------- Getters / Setters -----------------

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;
        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;
        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        if (!in_array($role, [self::ROLE_ADMIN, self::ROLE_USER])) {
            throw new \InvalidArgumentException("Role invalide");
        }
        $this->role = $role;
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

    // ----------------- Symfony Security -----------------

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        // retourne le rôle au format ROLE_ADMIN / ROLE_CLIENT
        return ['ROLE_' . strtoupper($this->role)];
    }

    public function setRoles(array $roles): static
    {
        // tu peux ignorer ou utiliser pour ajouter des rôles supplémentaires
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function eraseCredentials(): void
    {
        // On n’a pas de données temporaires sensibles ici
    }

    public function getWallet(): ?wallet
    {
        return $this->wallet;
    }

    public function setWallet(?wallet $wallet): static
    {
        $this->wallet = $wallet;

        return $this;
    }
}
