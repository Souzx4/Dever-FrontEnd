import java.util.Scanner;

public class Caso03 {
    public static void caso_03() {
        System.out.println("digite um dos comentados abaixo no menu");
        System.out.println("1: comprar; 2: vender; 3: Listar; 4: sair");

        Scanner scan = new Scanner(System.in);
        int opcao = scan.nextInt();

        switch(opcao) {
            case 1:
                System.out.println("Você escolheu comprar");
                break;
            case 2:
                System.out.println("Você escolheu vender");
                break;
            case 3: 
                System.out.println("Você escolheu listar");
                break;
            default:
                System.out.println("Você escolheu sair");
        }
    }

    public static void main(String[] args) {
        caso_03();
    }
}