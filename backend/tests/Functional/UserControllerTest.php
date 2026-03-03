<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use App\Entity\User;
use App\Entity\Wallet;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserControllerTest extends WebTestCase
{
    private $client;
    private $em;
    private $hasher;

    /**
     * Set up the test environment before each test.
     * Creates a fresh HTTP client, EntityManager and password hasher.
     */
    protected function setUp(): void
    {
        $this->client = static::createClient();
        $container = self::getContainer();
        $this->em = $container->get(EntityManagerInterface::class);
        $this->hasher = $container->get(UserPasswordHasherInterface::class);
    }

    /**
     * Helper method to create and persist a user with a hashed password.
     * Avoids code duplication across tests.
     */
    private function createUser(string $firstname, string $lastname, string $email, string $role = 'user'): User
    {
        $user = new User();
        $user->setFirstname($firstname);
        $user->setLastname($lastname);
        $user->setEmail($email);
        $user->setRole($role); // Must be 'user' or 'admin', not 'ROLE_USER'
        $user->setPassword($this->hasher->hashPassword($user, 'password123'));

        // Create a wallet for the user (required by the OneToOne relation)
        $wallet = new Wallet($user);
        $user->setWallet($wallet);

        $this->em->persist($user);
        $this->em->persist($wallet);
        $this->em->flush();

        return $user;
    }

    /**
     * Test that listing all users returns a 200 response with a JSON array
     * containing the created user.
     */
    public function testListUsers(): void
    {
        // Create a user to ensure at least one exists in the list
        $user = $this->createUser('Test', 'User', 'list@example.com');

        $this->client->request('GET', '/api/users');

        $this->assertResponseIsSuccessful();
        $this->assertJson($this->client->getResponse()->getContent());

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertIsArray($data);

        // Find our created user in the response list
        $found = false;
        foreach ($data as $u) {
            if ($u['id'] === $user->getId()) {
                $found = true;
                $this->assertEquals('Test', $u['firstname']);
                $this->assertEquals('User', $u['lastname']);
                $this->assertEquals('list@example.com', $u['email']);
            }
        }

        $this->assertTrue($found, 'The created user should appear in the list.');
    }

    /**
     * Test that updating a user's firstname and lastname returns 200
     * with the updated values in the response.
     */
    public function testUpdateUser(): void
    {
        // Create a user to update
        $user = $this->createUser('Old', 'Name', 'update@example.com');

        $this->client->request(
            'PUT',
            '/api/users/' . $user->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstname' => 'New',
                'lastname'  => 'Name'
            ])
        );

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);

        // Assert the user was correctly updated
        $this->assertEquals('New', $data['user']['firstname']);
        $this->assertEquals('Name', $data['user']['lastname']);
    }

    /**
     * Test that deleting an existing user returns 200
     * with a success message.
     */
    public function testDeleteUser(): void
    {
        // Create a user to delete
        $user = $this->createUser('ToDelete', 'User', 'delete@example.com');
        $userId = $user->getId();

        $this->client->request('DELETE', '/api/users/' . $userId);

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Utilisateur supprimé avec succès', $data['message']);

        // Verify the user no longer exists in the database
        $deletedUser = $this->em->getRepository(User::class)->find($userId);
        $this->assertNull($deletedUser, 'The user should no longer exist in the database.');
    }

    /**
     * Test that updating a non-existent user returns 404
     * with the appropriate error message.
     */
    public function testUpdateUserNotFound(): void
    {
        $this->client->request(
            'PUT',
            '/api/users/999999', // Non-existent user ID
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['firstname' => 'New'])
        );

        $this->assertResponseStatusCodeSame(404);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Utilisateur non trouvé', $data['message']);
    }

    /**
     * Test that deleting a non-existent user returns 404
     * with the appropriate error message.
     */
    public function testDeleteUserNotFound(): void
    {
        $this->client->request('DELETE', '/api/users/999999'); // Non-existent user ID

        $this->assertResponseStatusCodeSame(404);

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('Utilisateur non trouvé', $data['message']);
    }

    /**
     * Test that updating only the email of a user works correctly.
     */
    public function testUpdateUserEmail(): void
    {
        $user = $this->createUser('Email', 'Test', 'oldemail@example.com');

        $this->client->request(
            'PUT',
            '/api/users/' . $user->getId(),
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'newemail@example.com'])
        );

        $this->assertResponseIsSuccessful();

        $data = json_decode($this->client->getResponse()->getContent(), true);
        $this->assertEquals('newemail@example.com', $data['user']['email']);
    }

    /**
     * Clean up the database after each test to avoid data conflicts
     * between test runs (e.g. unique constraint violations).
     */
    protected function tearDown(): void
    {
        $this->em->createQuery('DELETE FROM App\Entity\Transaction t')->execute();
        $this->em->createQuery('DELETE FROM App\Entity\Wallet w')->execute();
        $this->em->createQuery('DELETE FROM App\Entity\User u')->execute();

        parent::tearDown();
        $this->em->close();
        $this->em = null;
    }
}