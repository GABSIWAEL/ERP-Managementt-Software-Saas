import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "123456789";
        String hash = encoder.encode(password);
        System.out.println("BCrypt hash for '123456789': " + hash);
        
        // Verify it
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + matches);
    }
}
