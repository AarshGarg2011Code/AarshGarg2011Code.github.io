import pygame
import random
pygame.init()
Brown = (139, 69, 19)
LightBlue = (150, 150, 255)
Gold = (255, 215, 0)
LuckyBlockColor = (255, 223, 0)
BrickColor = (200, 200, 200)
TubeColor = (0, 255, 0)
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Super Wario Bros")
wario_image = pygame.image.load('wario.png')
wario_image = pygame.transform.scale(wario_image, (100, 100))
coin_radius = 10
num_coins = 5
coins = []
for _ in range(num_coins):
    while True:
        new_coin_x = random.randint(50, width - 50)
        new_coin_y = height - 150 - coin_radius
        if all(abs(new_coin_x - coin[0]) > 30 for coin in coins):
            coins.append((new_coin_x, new_coin_y))
            break
lucky_block_size = 30
num_lucky_blocks = 3
lucky_blocks = []
for _ in range(num_lucky_blocks):
    while True:
        new_lucky_block_x = random.randint(50, width - 50)
        if all(abs(new_lucky_block_x - coin[0]) > 50 for coin in coins):
            lucky_blocks.append((new_lucky_block_x, height - 180, False))
            break
obstacles = [
    pygame.Rect(300, height - 100, 100, 20),
    pygame.Rect(500, height - 120, 100, 20),
    pygame.Rect(200, height - 150, 50, 100),
]
wario_x = 100
wario_y = height - 145
normal_speed = 0.5
speed_up_factor = 1.5
is_jumping = False
jump_height = 15
gravity = 0.3
velocity_y = 0
score = 0
ground_height = 60
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    screen.fill(LightBlue)
    pygame.draw.rect(screen, Brown, (0, height - ground_height, width, ground_height))
    for coin_x, coin_y in coins:
        pygame.draw.circle(screen, Gold, (coin_x, coin_y), coin_radius)
    for i, (lucky_block_x, lucky_block_y, bouncing) in enumerate(lucky_blocks):
        pygame.draw.rect(screen, LuckyBlockColor, (lucky_block_x, lucky_block_y, lucky_block_size, lucky_block_size))
        if bouncing:
            lucky_blocks[i] = (lucky_block_x, lucky_block_y + 0.2, bouncing)
            if lucky_block_y >= height - 180: 
                lucky_blocks[i] = (lucky_block_x, height - 180, False)
    for obstacle in obstacles:
        if obstacle.height == 20:
            pygame.draw.rect(screen, BrickColor, obstacle)
        else:
            pygame.draw.rect(screen, TubeColor, obstacle)
    keys = pygame.key.get_pressed()
    current_speed = normal_speed
    if keys[pygame.K_LSHIFT] or keys[pygame.K_RSHIFT]:
        current_speed = speed_up_factor
    if keys[pygame.K_LEFT]:
        wario_x -= current_speed
    if keys[pygame.K_RIGHT]:
        wario_x += current_speed
    if keys[pygame.K_SPACE]:
        if not is_jumping:
            is_jumping = True
            velocity_y = -jump_height
    if is_jumping or wario_y < height - 145:
        wario_y += velocity_y
        velocity_y += gravity
        if wario_y >= height - 145:
            wario_y = height - 145
            is_jumping = False
            velocity_y = 0
    wario_rect = pygame.Rect(wario_x, wario_y, 100, 100)
    for obstacle in obstacles:
        if wario_rect.colliderect(obstacle):
            if wario_y + 100 > obstacle.top and wario_y + 100 < obstacle.bottom:
                wario_y = obstacle.top - 100
                is_jumping = False
                velocity_y = 0
            break
    if wario_x < 0:
        wario_x = 0
    if wario_x > width - 100:
        wario_x = width - 100
    coins_to_remove = []
    for coin_x, coin_y in coins:
        coin_rect = pygame.Rect(coin_x - coin_radius, coin_y - coin_radius, coin_radius * 2, coin_radius * 2)
        if wario_rect.colliderect(coin_rect):
            score += 1
            coins_to_remove.append((coin_x, coin_y))
    for coin in coins_to_remove:
        coins.remove(coin)
        while True:
            new_coin_x = random.randint(50, width - 50)
            new_coin_y = height - 150 - coin_radius
            if all(abs(new_coin_x - c[0]) > 30 for c in coins):
                coins.append((new_coin_x, new_coin_y))
                break
    for i, (lucky_block_x, lucky_block_y, bouncing) in enumerate(lucky_blocks):
        lucky_block_rect = pygame.Rect(lucky_block_x, lucky_block_y, lucky_block_size, lucky_block_size)
        if wario_rect.colliderect(lucky_block_rect):
            score += 5
            lucky_blocks[i] = (lucky_block_x, lucky_block_y - 15, True)
            while True:
                new_lucky_block_x = random.randint(50, width - 50)
                if all(abs(new_lucky_block_x - coin[0]) > 50 for coin in coins):
                    lucky_blocks[i] = (new_lucky_block_x, height - 180, False)
                    break
    screen.blit(wario_image, (wario_x, wario_y))
    font = pygame.font.SysFont(None, 36)
    score_text = font.render(f'Score: {score}', True, (0, 0, 0))
    screen.blit(score_text, (10, 10))
    pygame.display.flip()
pygame.quit()
