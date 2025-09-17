import java.util.*;
public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        int sum = 0;
        
        if (n > 0) {
            for(int i = 0; i < n; i++){
                if (sc.hasNextInt()) {
                    sum += sc.nextInt();
                }
            }
        }
        
        System.out.println(sum);
        sc.close();
    }
}
