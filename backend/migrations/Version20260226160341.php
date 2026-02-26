<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260226160341 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE quote (id INT AUTO_INCREMENT NOT NULL, price NUMERIC(18, 8) NOT NULL, quoted_at DATETIME NOT NULL, cryptocurrency_id INT NOT NULL, INDEX IDX_6B71CBF4583FC03A (cryptocurrency_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('CREATE TABLE transaction (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(10) NOT NULL, quantity NUMERIC(18, 8) NOT NULL, unit_price_eur NUMERIC(18, 8) NOT NULL, created_at DATETIME NOT NULL, wallet_id INT NOT NULL, cryptocurrency_id INT NOT NULL, INDEX IDX_723705D1712520F3 (wallet_id), INDEX IDX_723705D1583FC03A (cryptocurrency_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8');
        $this->addSql('ALTER TABLE quote ADD CONSTRAINT FK_6B71CBF4583FC03A FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrency (id)');
        $this->addSql('ALTER TABLE transaction ADD CONSTRAINT FK_723705D1712520F3 FOREIGN KEY (wallet_id) REFERENCES wallet (id)');
        $this->addSql('ALTER TABLE transaction ADD CONSTRAINT FK_723705D1583FC03A FOREIGN KEY (cryptocurrency_id) REFERENCES cryptocurrency (id)');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY `FK_8D93D649712520F3`');
        $this->addSql('DROP INDEX UNIQ_8D93D649712520F3 ON user');
        $this->addSql('ALTER TABLE user ADD role VARCHAR(20) NOT NULL, DROP wallet_id');
        $this->addSql('ALTER TABLE wallet ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE wallet ADD CONSTRAINT FK_7C68921FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7C68921FA76ED395 ON wallet (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE quote DROP FOREIGN KEY FK_6B71CBF4583FC03A');
        $this->addSql('ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1712520F3');
        $this->addSql('ALTER TABLE transaction DROP FOREIGN KEY FK_723705D1583FC03A');
        $this->addSql('DROP TABLE quote');
        $this->addSql('DROP TABLE transaction');
        $this->addSql('ALTER TABLE user ADD wallet_id INT DEFAULT NULL, DROP role');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT `FK_8D93D649712520F3` FOREIGN KEY (wallet_id) REFERENCES wallet (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649712520F3 ON user (wallet_id)');
        $this->addSql('ALTER TABLE wallet DROP FOREIGN KEY FK_7C68921FA76ED395');
        $this->addSql('DROP INDEX UNIQ_7C68921FA76ED395 ON wallet');
        $this->addSql('ALTER TABLE wallet DROP user_id');
    }
}
