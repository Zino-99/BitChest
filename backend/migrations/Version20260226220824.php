<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260226220824 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cryptocurrency (id INT AUTO_INCREMENT NOT NULL, symbol VARCHAR(10) NOT NULL, name VARCHAR(100) NOT NULL, UNIQUE INDEX UNIQ_CC62CFADECC836F9 (symbol), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('CREATE TABLE quote (id INT AUTO_INCREMENT NOT NULL, price NUMERIC(18, 8) NOT NULL, quoted_at DATETIME NOT NULL, cryptocurrency_id INT NOT NULL, INDEX IDX_6B71CBF4583FC03A (cryptocurrency_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('CREATE TABLE transaction (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(10) NOT NULL, quantity NUMERIC(18, 8) NOT NULL, unit_price_eur NUMERIC(18, 8) NOT NULL, created_at DATETIME NOT NULL, wallet_id INT NOT NULL, cryptocurrency_id INT NOT NULL, INDEX IDX_723705D1712520F3 (wallet_id), INDEX IDX_723705D1583FC03A (cryptocurrency_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(100) NOT NULL, lastname VARCHAR(100) NOT NULL, role VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('CREATE TABLE wallet (id INT AUTO_INCREMENT NOT NULL, euro_balance NUMERIC(18, 2) DEFAULT \'500.00\' NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_7C68921FA76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('ALTER TABLE quote ADD CONSTRAINT FK_6B71CBF4583FC03A FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrency (id)');
        $this->addSql('ALTER TABLE transaction ADD CONSTRAINT FK_723705D1712520F3 FOREIGN KEY (wallet_id) REFERENCES wallet (id)');
        $this->addSql('ALTER TABLE transaction ADD CONSTRAINT FK_723705D1583FC03A FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrency (id)');
        $this->addSql('ALTER TABLE wallet ADD CONSTRAINT FK_7C68921FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE quote DROP FOREIGN KEY FK_6B71CBF4583FC03A');
        $this->addSql('ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1712520F3');
        $this->addSql('ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1583FC03A');
        $this->addSql('ALTER TABLE wallet DROP FOREIGN KEY FK_7C68921FA76ED395');
        $this->addSql('DROP TABLE cryptocurrency');
        $this->addSql('DROP TABLE quote');
        $this->addSql('DROP TABLE transaction');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE wallet');
    }
}
