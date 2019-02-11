import { JsonObject, JsonProperty, JsonConverter, JsonCustomConvert, Any } from "json2typescript";
import { DecimalConverter } from "../allEntity";

@JsonObject('AnaisItem')
export class AnaisItem {

  @JsonProperty('ItemId', Number)
  public ItemId: number;

  @JsonProperty('ItemTitle', String)
  public ItemTitle: string;

  @JsonProperty('DefaultMin', DecimalConverter, true)
  public DefaultMin?: number;

  @JsonProperty('Min', DecimalConverter, true)
  public Min?: number;

  @JsonProperty('DefaultMax', DecimalConverter, true)
  public DefaultMax?: number;

  @JsonProperty('Max', DecimalConverter, true)
  public Max?: number;

  @JsonProperty('Coefficient', DecimalConverter, true)
  public Coefficient: number;

  @JsonProperty('Result', DecimalConverter, true)
  public Result: number;

  @JsonProperty('Score', DecimalConverter, true)
  public Score: number;

  @JsonProperty('Unit', String)
  public Unit: string;

  @JsonProperty('ScoreFormula', String)
  public ScoreFormula: string;

  @JsonProperty('ScoreFormulaDisplay', String)
  public ScoreFormulaDisplay: string;

  constructor() {
    this.Coefficient = undefined;
    this.DefaultMax = undefined;
    this.DefaultMin = undefined;
    this.ItemId = undefined;
    this.ItemTitle = undefined;
    this.Max = undefined;
    this.Min = undefined;
    this.Result = undefined;
    this.Score = undefined;
    this.Unit = undefined;
    this.ScoreFormula = undefined;
    this.ScoreFormulaDisplay = undefined;

  }
}
