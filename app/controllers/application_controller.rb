class ApplicationController < ActionController::API
  before_action :fake_load
  # SPAのローディングを確認するため、意図的に処理を遅らせている
  def fake_load
    sleep(1)
  end
end
