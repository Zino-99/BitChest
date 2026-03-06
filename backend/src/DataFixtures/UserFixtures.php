<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\Wallet;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $hasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // ─── Admin ───
        $admin = new User();
        $admin->setFirstname('Yacine');
        $admin->setLastname('Djadel');
        $admin->setEmail('yacine@bitchest.com');
        $admin->setPassword($this->hasher->hashPassword($admin, 'admin1234'));
        $admin->setRole('admin');

        $adminWallet = new Wallet($admin);
        $admin->setWallet($adminWallet);

        $manager->persist($admin);
        $manager->persist($adminWallet);

        // ─── User ───
        $user = new User();
        $user->setFirstname('Djamel');
        $user->setLastname('Ouazib');
        $user->setEmail('djamel@gmail.com');
        $user->setPassword($this->hasher->hashPassword($user, 'user1234'));
        $user->setRole('user');

        $userWallet = new Wallet($user);
        $user->setWallet($userWallet);

        $manager->persist($user);
        $manager->persist($userWallet);

        $manager->flush();
    }
}