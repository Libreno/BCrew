using System;

namespace BCrew.Controllers
{
	public class CarInfoRandomGenerator
	{
		static Tuple<string, string>[] MODELS = new[] { 
			new Tuple<string, string>("Chevrolet", "Lacetti"),
			new Tuple<string, string>("Chevrolet", "Tahoe"),
			new Tuple<string, string>("Kia", "Rio"),
			new Tuple<string, string>("Kia", "Sportage"),
			new Tuple<string, string>("Hyndai", "Solaris"),
			new Tuple<string, string>("Hyndai", "Elantra"),
			new Tuple<string, string>("Nissan", "Micra")
		};
		static string[] COLORS = new[] {
			"синий",
			"зеленый",
			"серебристый",
			"чёрный",
			"белый"
		};
		static string LETTERS = "АВСЕНКМОРТХУ";
		public static Tuple<string, string, string, string> Next() {
			var rnd = new Random(DateTime.Now.Millisecond);
			var car = MODELS[rnd.Next(0, MODELS.Length)];
			Func<char> rndLetter = () => { 
				return LETTERS[rnd.Next(0, LETTERS.Length - 1)]; 
			};
			return new Tuple<string, string, string, string>(
				car.Item1,
				car.Item2,
				COLORS[rnd.Next(0, COLORS.Length)],
				$"{ rndLetter() }{ rnd.Next(0, 9) }{ rnd.Next(0, 9) }{ rnd.Next(0, 9) }{ rndLetter() }{ rndLetter() }"
			);
		}
	}
}
