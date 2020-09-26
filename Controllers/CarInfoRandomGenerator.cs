using System;

namespace BCrew.Controllers
{
	public class CarInfoRandomGenerator
	{
		static Tuple<string, string>[] MODELS = new[] { 
			new Tuple<string, string>("Oriolus", "Oriolus"),
			new Tuple<string, string>("Oriolus", "Isabellae"),
			new Tuple<string, string>("Ursus", "Arctos"),
			new Tuple<string, string>("Ursus", "Middendorffi"),
			new Tuple<string, string>("Papilio", "Machaon"),
			new Tuple<string, string>("Papilio", "Zalmoxis"),
			new Tuple<string, string>("Pholidoptera", "Pustulipes")
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
			var rnd = new Random();
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
