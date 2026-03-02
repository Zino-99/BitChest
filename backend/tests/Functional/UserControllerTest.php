<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserControllerTest extends WebTestCase
{
    private $client;
    private $em;
    private $hasher;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $container = self::getContainer();
        $this->em = $container->get(EntityManagerInterface::class);
        $this->hasher = $container->get(UserPasswordHasherInterface::class);
    }

    public function testListUsers()
    {
        // Crée un utilisateur pour le test
        $user = new User();
        $user->setFirstname('Test');
        $user->setLastname('User');
        $user->setEmail('test@example.com');
        $user->setRole('ROLE_USER');
        $user->setPassword($this->hasher->hashPassword($user, 'password123'));

        $this->em->persist($user);
        $this->em->flush();

        $this->client->request('GET', '/api/users');

        $this->assertResponseIsSuccessful();
        $this->assertJson($this->client->getResponse()->getContent());

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);

        $found = false;
        foreach ($data as $u) {
            if ($u['id'] === $user->getId()) {
                $found = true;
                $this->assertEquals('Test', $u['firstname']);
                $this->assertEquals('User', $u['lastname']);
            }
        }
        $this->assertTrue($found, 'L’utilisateur doit apparaître dans la liste.');
    }

    public function testUpdateUser()
    {
        $user = new User();
        $user->setFirstname('Old');
        $user->setLastname('Name');
        $user->setEmail('old@example.com');
        $user->setRole('ROLE_USER');
        $user->setPassword($this->hasher->hashPassword($user, 'password'));

        $this->em->persist($user);
        $this->em->flush();

        $this->client->request(
            'PUT',
            '/api/users/'.$user->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['firstname' => 'New', 'lastname' => 'Name'])
        );

        $response = $this->client->getResponse();
        $this->assertResponseIsSuccessful();
        $data = json_decode($response->getContent(), true);
        $this->assertEquals('New', $data['user']['firstname']);
        $this->assertEquals('Name', $data['user']['lastname']);
    }

    public function testDeleteUser()
    {
        $user = new User();
        $user->setFirstname('ToDelete');
        $user->setLastname('User');
        $user->setEmail('delete@example.com');
        $user->setRole('ROLE_USER');
        $user->setPassword($this->hasher->hashPassword($user, 'password'));
        $this->em->persist($user);
        $this->em->flush();

        $this->client->request('DELETE', '/api/users/'.$user->getId());
        $response = $this->client->getResponse();
        $this->assertResponseIsSuccessful();
        $this->assertStringContainsString('Utilisateur supprimé avec succès', $response->getContent());
    }

    public function testUpdateUserNotFound()
    {
        $this->client->request(
            'PUT',
            '/api/users/999999',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['firstname' => 'New'])
        );

        $this->assertResponseStatusCodeSame(404);
        $this->assertStringContainsString('Utilisateur non trouvé', $this->client->getResponse()->getContent());
    }

    public function testDeleteUserNotFound()
    {
        $this->client->request('DELETE', '/api/users/999999');
        $this->assertResponseStatusCodeSame(404);
        $this->assertStringContainsString('Utilisateur non trouvé', $this->client->getResponse()->getContent());
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        $this->em->close();
        $this->em = null;
    }
}