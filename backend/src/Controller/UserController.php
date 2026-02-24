<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class UserController extends AbstractController
{
    // GET /api/users — Liste tous les utilisateurs
    #[Route('/api/users', name: 'api_users_list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();

        return $this->json(array_map(fn($u) => [
            'id'        => $u->getId(),
            'firstname' => $u->getFirstname(),
            'lastname'  => $u->getLastname(),
            'email'     => $u->getEmail(),
            'role'      => $u->getRole(),
            'createdAt' => $u->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $users));
    }

    // PUT /api/users/{id} — Modifier un utilisateur
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
        if (!empty($data['role']))      $user->setRole($data['role']);
        if (!empty($data['password']))  $user->setPassword($hasher->hashPassword($user, $data['password']));

        $em->flush();

        return $this->json([
            'message' => 'Utilisateur mis à jour',
            'user' => [
                'id'        => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname'  => $user->getLastname(),
                'email'     => $user->getEmail(),
                'role'      => $user->getRole(),
                'createdAt' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            ]
        ], 200);
    }

    // DELETE /api/users/{id} — Supprimer un utilisateur
    #[Route('/api/users/{id}', name: 'api_users_delete', methods: ['DELETE'])]
    public function delete(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);

        if (!$user) {
            return $this->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Utilisateur supprimé avec succès'], 200);
    }
}