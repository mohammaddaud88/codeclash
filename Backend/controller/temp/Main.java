import java.util.*;
public class Main {
     public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Read number of elements
        int n = sc.nextInt();
        int[] arr = new int[n];

        // Read elements into array
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }

        // Compute sum
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += arr[i];
        }

        // Print result
        System.out.println(sum);

        sc.close();
    }
}