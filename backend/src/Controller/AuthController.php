<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class AuthController extends AbstractController
{

    #[Route('/api/users/{id}', name: 'api_users_update', methods: ['PUT'])]
        public function update(
            int $id,
            Request $request,
            EntityManagerInterface $em,
    UserPasswordHasherInterface $hasher
): JsonResponse {
    $user = $em->getRepository(User::class)->find($id);

    if (!$user) {
        return $this->json(['message' => 'Utilisateur non trouvé'], 404);
    }

    $data = json_decode($request->getContent(), true);

    if (!empty($data['firstname'])) $user->setFirstname($data['firstname']);
    if (!empty($data['lastname']))  $user->setLastname($data['lastname']);
    if (!empty($data['email']))     $user->setEmail($data['email']);
    if (!empty($data['password']))  $user->setPassword($hasher->hashPassword($user, $data['password']));

    $em->flush();

    return $this->json([
        'message' => 'Informations mises à jour',
        'user' => [
            'id'        => $user->getId(),
            'firstname' => $user->getFirstname(),
            'lastname'  => $user->getLastname(),
            'email'     => $user->getEmail(),
            'role'      => $user->getRole(),
        ]
    ], 200);
}


    #[Route('/api/users', name: 'api_users_create', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['firstname']) || empty($data['lastname']) || empty($data['email']) || empty($data['password'])) {
            return $this->json(['message' => 'Tous les champs sont obligatoires'], 400);
        }

        $existing = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($existing) {
            return $this->json(['message' => 'Cet email est déjà utilisé'], 409);
        }

        $user = new User();
        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);
        $user->setEmail($data['email']);
        $user->setPassword($hasher->hashPassword($user, $data['password']));
        // role = 'user' par défaut grâce au constructeur de l'entité

        $em->persist($user);
        $em->flush();

        return $this->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id'        => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname'  => $user->getLastname(),
                'email'     => $user->getEmail(),
                'role'      => $user->getRole(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], 201);
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(
        Request $request,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $hasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['message' => 'Email et mot de passe requis'], 400);
        }

        $user = $em->getRepository(User::class)->findOneBy(['email' => $data['email']]);

        if (!$user || !$hasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['message' => 'Identifiants incorrects'], 401);
        }

        return $this->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id'        => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname'  => $user->getLastname(),
                'email'     => $user->getEmail(),
                'role'      => $user->getRole(),
            ]
        ], 200);
    }
}