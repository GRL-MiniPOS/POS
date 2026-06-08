/**
 * 庫存顯示用的規格 view model
 * 用於 inventory 列表把商品變體攤平成可顯示的 {名稱, 數量}
 */
export interface IProductSpec {
  id: string
  name: string
  quantity: number
}

/**
 * 新增商品表單草稿型別
 * 對應後端 option_groups（規格類型 + 選項值，最多 2 組）+ variants（選項組合矩陣）
 */
export interface IOptionValueDraft {
  id: string // 供 React key 的穩定本地 id（避免用陣列 index 當 key）
  value: string // 選項值文字，如「紅」
}

export interface IOptionGroupDraft {
  id: string // 供 React key 的本地 id
  name: string // 規格類型，如「顏色」
  values: IOptionValueDraft[] // 選項值清單
}

export interface IVariantDraft {
  key: string // 由 optionValues 依 group 順序串成的穩定字串
  optionValues: Record<string, string> // 如 { 顏色: '紅', 尺寸: 'S' }
  quantity: string // 字串便於輸入框
  saleStatus: 'active' | 'inactive'
}
