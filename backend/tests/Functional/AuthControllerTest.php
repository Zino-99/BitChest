<?php

namespace App\Tests\Functional;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class AuthControllerTest extends WebTestCase
{
    public function testRegisterSuccess(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstname' => 'Mada',
                'lastname'  => 'Ourida',
                'email'     => 'mada@test.com',
                'password'  => 'password123'
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertEquals('Utilisateur créé avec succès', $data['message']);
        $this->assertEquals('mada@test.com', $data['user']['email']);
    }

    public function testRegisterMissingFields(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'test@test.com'
            ])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testRegisterEmailAlreadyExists(): void
    {
        $client = static::createClient();

        // 1️⃣ créer un utilisateur
        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstname' => 'Test',
                'lastname'  => 'User',
                'email'     => 'exist@test.com',
                'password'  => 'password123'
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        // 2️⃣ essayer avec le même email
        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstname' => 'Test2',
                'lastname'  => 'User2',
                'email'     => 'exist@test.com',
                'password'  => 'password123'
            ])
        );

        $this->assertResponseStatusCodeSame(409);
    }

    public function testLoginSuccess(): void
    {
        $client = static::createClient();

        // créer user
        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstname' => 'Login',
                'lastname'  => 'User',
                'email'     => 'login@test.com',
                'password'  => 'password123'
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        // login
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email'    => 'login@test.com',
                'password' => 'password123'
            ])
        );

        $this->assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertEquals('Connexion réussie', $data['message']);
        $this->assertEquals('login@test.com', $data['user']['email']);
    }

    public function testLoginWrongPassword(): void
    {
        $client = static::createClient();

        // créer user
        $client->request(
            'POST',
            '/api/users',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'firstname' => 'Wrong',
                'lastname'  => 'Password',
                'email'     => 'wrong@test.com',
                'password'  => 'password123'
            ])
        );

        $this->assertResponseStatusCodeSame(201);

        // mauvais mot de passe
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email'    => 'wrong@test.com',
                'password' => 'badpassword'
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }
}