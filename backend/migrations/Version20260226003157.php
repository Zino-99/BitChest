<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260226003157 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cryptocurrency (id INT AUTO_INCREMENT NOT NULL, symbol VARCHAR(10) NOT NULL, name VARCHAR(100) NOT NULL, UNIQUE INDEX UNIQ_CC62CFADECC836F9 (symbol), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('ALTER TABLE wallet CHANGE euro_balance euro_balance NUMERIC(18, 2) DEFAULT 500 NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE cryptocurrency');
        $this->addSql('ALTER TABLE wallet CHANGE euro_balance euro_balance NUMERIC(18, 2) DEFAULT \'500.00\' NOT NULL');
    }
}
