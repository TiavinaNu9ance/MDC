<?php
/* Madagascar Data Camp — envoi du formulaire de contact par e-mail (hébergement Namecheap / cPanel).
   Les demandes arrivent sur DESTINATAIRE. Le visiteur est mis en « Répondre à ». */

const DESTINATAIRE = 'contact@datacamp.business';
const EXPEDITEUR   = 'site@datacamp.business';   // adresse du domaine : évite le classement en spam
const SITE         = 'datacamp.business';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function repondre($code, $ok, $msg) {
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
function champ($nom, $max = 300) {
    $v = isset($_POST[$nom]) ? trim((string) $_POST[$nom]) : '';
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max, 'UTF-8');
}
function ligne($v) { return str_replace("\n", ' ', $v); } // pas de retour à la ligne dans les en-têtes

if ($_SERVER['REQUEST_METHOD'] !== 'POST') repondre(405, false, 'Méthode non autorisée.');

// Anti-robots : champ caché rempli = robot (on fait semblant d'accepter)
if (champ('_gotcha') !== '') repondre(200, true, 'Merci.');

// Limite : 5 envois par heure et par adresse IP
$ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
$fichier = sys_get_temp_dir() . '/mdc_contact_' . md5($ip);
$historique = is_file($fichier) ? array_filter(explode(',', (string) file_get_contents($fichier)), function ($t) { return $t > time() - 3600; }) : [];
if (count($historique) >= 5) repondre(429, false, 'Trop de demandes. Réessayez plus tard ou écrivez-nous directement.');

$nom          = ligne(champ('nom', 120));
$email        = ligne(champ('email', 160));
$organisation = ligne(champ('organisation', 160));
$telephone    = ligne(champ('telephone', 40));
$type         = ligne(champ('type', 40));
$formation    = ligne(champ('formation', 80));
$participants = ligne(champ('participants', 10));
$fmfp         = champ('fmfp', 5) !== '' ? 'Oui' : 'Non';
$sujet        = ligne(champ('sujet', 120));
$message      = champ('message', 5000);

if (mb_strlen($nom) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($message) < 5) {
    repondre(422, false, 'Merci de renseigner votre nom, un e-mail valide et votre besoin.');
}

$objet = 'Site web — ' . ($sujet !== '' ? $sujet : 'Demande de contact') . ' — ' . $nom;
$corps = "Nouvelle demande reçue depuis le site " . SITE . "\n\n"
       . "Nom : $nom\n"
       . "E-mail : $email\n"
       . "Téléphone : " . ($telephone ?: '-') . "\n"
       . "Organisation : " . ($organisation ?: '-') . "\n"
       . "Type : " . ($type ?: '-') . "\n"
       . "Formation souhaitée : " . ($formation ?: '-') . "\n"
       . "Participants : " . ($participants ?: '-') . "\n"
       . "Financement FMFP : $fmfp\n"
       . "Sujet : " . ($sujet ?: '-') . "\n\n"
       . "Message :\n$message\n\n"
       . "---\nEnvoyé le " . date('d/m/Y H:i') . " depuis l'IP $ip";

$entetes  = 'From: "Site MDC" <' . EXPEDITEUR . ">\r\n";
$entetes .= 'Reply-To: ' . (preg_match('/^[^@\s]+@[^@\s]+$/', $email) ? $email : EXPEDITEUR) . "\r\n";
$entetes .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

$objetEncode = '=?UTF-8?B?' . base64_encode($objet) . '?=';
$envoye = @mail(DESTINATAIRE, $objetEncode, $corps, $entetes, '-f' . EXPEDITEUR);

if (!$envoye) repondre(500, false, "L'envoi a échoué. Écrivez-nous à " . DESTINATAIRE . '.');

$historique[] = time();
@file_put_contents($fichier, implode(',', $historique));
repondre(200, true, 'Merci ! Votre demande est envoyée, nous revenons vers vous rapidement.');
