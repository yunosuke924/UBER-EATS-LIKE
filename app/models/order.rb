class Order < ApplicationRecord
  has_many :line_foods

  validates :total_price, numericality: { greater_than: 0 }

  def save_with_update_line_foods!(line_foods)
    ActiveRecord::Base.transaction do
      line_foods.each do |line_food|
        # ２つの処理のいずれかが失敗した場合に全ての処理をなかったことにするように配慮
        # selfはレシーバーであるorderインスタンス（本注文）が入る。
        line_food.update!(active: false, order: self) # 例外が起きる可能性①
      end
      self.save! # 例外が起きる可能性②
    end
  end
end
